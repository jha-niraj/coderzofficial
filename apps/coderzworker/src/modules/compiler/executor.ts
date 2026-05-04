import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import Docker from 'dockerode';
import type { CodeSubmission, ExecutionResult, TestCase, TestCaseResult, SupportedLanguage } from '../../types/index.js';
import { LANGUAGE_CONFIGS } from '../../config/languages.js';
import logger from '../../utils/logger.js';

const execAsync = promisify(exec);

const DOCKER_ENABLED = process.env.DOCKER_ENABLED !== 'false';
const EXECUTION_TIMEOUT_MS = parseInt(process.env.EXECUTION_TIMEOUT_MS || '10000', 10);
const MAX_MEMORY_MB = parseInt(process.env.MAX_MEMORY_MB || '128', 10);

let docker: Docker | null = null;

function getDockerClient(): Docker {
  if (!docker) {
    docker = new Docker();
  }
  return docker;
}

async function pullImage(imageName: string): Promise<void> {
  const client = getDockerClient();
  return new Promise((resolve, reject) => {
    client.pull(imageName, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) {
        reject(err);
        return;
      }
      client.modem.followProgress(stream, (progressErr: Error | null) => {
        if (progressErr) {
          reject(progressErr);
        } else {
          resolve();
        }
      });
    });
  });
}

function extractJavaClassName(code: string): string {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match?.[1] ?? 'Main';
}

function buildRunCommand(
  language: SupportedLanguage,
  filename: string,
  config: (typeof LANGUAGE_CONFIGS)[SupportedLanguage]
): { compileCmd?: string; runCmd: string } {
  const basename = path.basename(filename);
  const nameWithoutExt = path.basename(filename, config.fileExtension);
  const output = nameWithoutExt;

  let runCmd = config.runCmd
    .replace('{filename}', basename)
    .replace('{classname}', nameWithoutExt)
    .replace('{output}', output);

  let compileCmd: string | undefined;
  if (config.compileCmd) {
    compileCmd = config.compileCmd
      .replace('{filename}', basename)
      .replace('{output}', output);
  }

  return { compileCmd, runCmd };
}

async function executeWithDocker(
  submission: CodeSubmission,
  stdin?: string
): Promise<ExecutionResult> {
  const config = LANGUAGE_CONFIGS[submission.language];
  const executionId = uuidv4();
  const tmpDir = path.join(os.tmpdir(), `coderzworker-${executionId}`);
  const startTime = Date.now();

  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    // For Java, use the class name as filename
    let baseFilename: string;
    if (submission.language === 'java') {
      const className = extractJavaClassName(submission.code);
      baseFilename = `${className}${config.fileExtension}`;
    } else {
      baseFilename = `solution${config.fileExtension}`;
    }

    const filePath = path.join(tmpDir, baseFilename);
    fs.writeFileSync(filePath, submission.code, 'utf8');

    // Pull image if not already available
    try {
      const client = getDockerClient();
      await client.getImage(config.image).inspect();
    } catch {
      logger.info(`Pulling Docker image: ${config.image}`);
      await pullImage(config.image);
      logger.info(`Docker image pulled: ${config.image}`);
    }

    const { compileCmd, runCmd } = buildRunCommand(submission.language, baseFilename, config);
    const timeout = submission.timeoutMs ?? EXECUTION_TIMEOUT_MS;
    const memoryBytes = MAX_MEMORY_MB * 1024 * 1024;

    const client = getDockerClient();

    // If language needs compilation, compile first
    if (compileCmd) {
      const compileResult = await runInContainer(
        client,
        config.image,
        tmpDir,
        compileCmd,
        undefined,
        timeout,
        memoryBytes
      );

      if (compileResult.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compileResult.stderr || compileResult.stdout,
          exitCode: compileResult.exitCode,
          executionTimeMs: Date.now() - startTime,
        };
      }
    }

    const result = await runInContainer(
      client,
      config.image,
      tmpDir,
      runCmd,
      stdin,
      timeout,
      memoryBytes
    );

    return {
      ...result,
      executionTimeMs: Date.now() - startTime,
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      logger.warn('Failed to clean up temp directory', { tmpDir, error: (cleanupErr as Error).message });
    }
  }
}

async function runInContainer(
  client: Docker,
  image: string,
  mountDir: string,
  cmd: string,
  stdin: string | undefined,
  timeoutMs: number,
  memoryBytes: number
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const shellCmd = stdin
    ? `echo ${JSON.stringify(stdin)} | ${cmd}`
    : cmd;

  const container = await client.createContainer({
    Image: image,
    Cmd: ['/bin/sh', '-c', shellCmd],
    WorkingDir: '/code',
    HostConfig: {
      Binds: [`${mountDir}:/code:rw`],
      Memory: memoryBytes,
      MemorySwap: memoryBytes,
      CpuQuota: 50000,
      CpuPeriod: 100000,
      NetworkMode: 'none',
      ReadonlyRootfs: false,
      AutoRemove: false,
      SecurityOpt: ['no-new-privileges'],
    },
    NetworkDisabled: true,
    AttachStdout: true,
    AttachStderr: true,
  });

  let stdout = '';
  let stderr = '';
  let timedOut = false;
  let containerRemoved = false;

  const timeoutHandle = setTimeout(async () => {
    timedOut = true;
    try {
      await container.kill();
    } catch {
      // Container may have already exited
    }
  }, timeoutMs);

  try {
    await container.start();

    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    await new Promise<void>((resolve) => {
      const chunks: { type: number; data: Buffer }[] = [];

      (logStream as NodeJS.ReadableStream).on('data', (chunk: Buffer) => {
        // Docker multiplexed stream: first byte = stream type (1=stdout, 2=stderr), bytes 4-7 = size
        if (chunk.length > 8) {
          let offset = 0;
          while (offset < chunk.length) {
            if (offset + 8 > chunk.length) break;
            const streamType = chunk[offset];
            const frameSize = chunk.readUInt32BE(offset + 4);
            const frameData = chunk.slice(offset + 8, offset + 8 + frameSize);
            chunks.push({ type: streamType ?? 0, data: frameData });
            offset += 8 + frameSize;
          }
        } else {
          // Raw data without multiplexing header
          chunks.push({ type: 1, data: chunk });
        }
      });

      (logStream as NodeJS.ReadableStream).on('end', () => {
        for (const { type, data } of chunks) {
          if (type === 1) {
            stdout += data.toString('utf8');
          } else if (type === 2) {
            stderr += data.toString('utf8');
          }
        }
        resolve();
      });

      (logStream as NodeJS.ReadableStream).on('error', () => resolve());
    });

    const inspectData = await container.inspect();
    const exitCode = timedOut ? 124 : (inspectData.State.ExitCode ?? 1);

    if (timedOut) {
      stderr = `Execution timed out after ${timeoutMs}ms`;
    }

    return { stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), exitCode };
  } finally {
    clearTimeout(timeoutHandle);
    if (!containerRemoved) {
      try {
        await container.remove({ force: true });
      } catch {
        // Container may have already been removed
      }
    }
  }
}

async function executeWithChildProcess(
  submission: CodeSubmission,
  stdin?: string
): Promise<ExecutionResult> {
  const allowedLanguages: SupportedLanguage[] = ['javascript', 'python'];
  if (!allowedLanguages.includes(submission.language)) {
    return {
      stdout: '',
      stderr: `Fallback execution only supports JavaScript and Python. Docker is required for ${submission.language}.`,
      exitCode: 1,
      executionTimeMs: 0,
    };
  }

  const config = LANGUAGE_CONFIGS[submission.language];
  const executionId = uuidv4();
  const tmpDir = path.join(os.tmpdir(), `coderzworker-${executionId}`);
  const startTime = Date.now();

  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    const filename = `solution${config.fileExtension}`;
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, submission.code, 'utf8');

    const { runCmd } = buildRunCommand(submission.language, filename, config);
    const timeout = submission.timeoutMs ?? EXECUTION_TIMEOUT_MS;

    let fullCmd = runCmd;
    if (stdin) {
      const escapedStdin = stdin.replace(/'/g, "'\\''");
      fullCmd = `echo '${escapedStdin}' | ${runCmd}`;
    }

    try {
      const { stdout, stderr } = await execAsync(fullCmd, {
        cwd: tmpDir,
        timeout,
        maxBuffer: 1024 * 1024,
      });

      return {
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
        exitCode: 0,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const execError = err as { stdout?: string; stderr?: string; code?: number; killed?: boolean; signal?: string };
      const isTimeout = execError.killed === true || execError.signal === 'SIGTERM';

      return {
        stdout: execError.stdout?.trimEnd() ?? '',
        stderr: isTimeout
          ? `Execution timed out after ${timeout}ms`
          : (execError.stderr?.trimEnd() ?? String(err)),
        exitCode: isTimeout ? 124 : (execError.code ?? 1),
        executionTimeMs: Date.now() - startTime,
      };
    }
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      logger.warn('Failed to clean up temp directory', { tmpDir, error: (cleanupErr as Error).message });
    }
  }
}

export async function executeCode(submission: CodeSubmission, stdinOverride?: string): Promise<ExecutionResult> {
  const stdin = stdinOverride ?? submission.stdin;

  if (DOCKER_ENABLED) {
    try {
      logger.debug('Executing code via Docker', {
        language: submission.language,
        codeLength: submission.code.length,
      });
      return await executeWithDocker({ ...submission, stdin }, stdin);
    } catch (err) {
      logger.error('Docker execution failed, falling back to child_process', {
        error: (err as Error).message,
      });
      logger.warn('WARNING: Using child_process fallback — NOT production safe');
      return await executeWithChildProcess({ ...submission, stdin }, stdin);
    }
  } else {
    logger.warn('Docker disabled — using child_process fallback (development only, NOT production safe)');
    return await executeWithChildProcess({ ...submission, stdin }, stdin);
  }
}

export async function runTestCases(
  submission: CodeSubmission,
  testCases: TestCase[]
): Promise<TestCaseResult[]> {
  const results: TestCaseResult[] = [];

  for (const testCase of testCases) {
    logger.debug('Running test case', { input: testCase.input, description: testCase.description });

    const result = await executeCode(submission, testCase.input);
    const actualOutput = result.stdout.trim();
    const expectedOutput = testCase.expectedOutput.trim();

    results.push({
      passed: actualOutput === expectedOutput,
      input: testCase.input,
      expectedOutput,
      actualOutput,
      description: testCase.description,
    });
  }

  return results;
}
