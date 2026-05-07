import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from 'zod';
import { CodeSubmissionSchema } from '../schemas/index';
import { executeCode, runTestCases } from '../modules/compiler/executor';
import { addExecutionJob, getJobResult } from '../modules/compiler/queue';
import { LANGUAGE_CONFIGS } from '../config/languages';
import type { CodeExecutionResponse } from '../types/index';
import logger from '../utils/logger';

const SYNC_EXECUTION_TIMEOUT_MS = 15000;

export async function executeSync(req: Request, res: Response): Promise<void> {
  const executionId = uuidv4();

  try {
    const parsed = CodeSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        executionId,
        error: parsed.error.errors.map((e) => e.message).join('; '),
      } satisfies CodeExecutionResponse);
      return;
    }

    const submission = parsed.data;
    logger.info('Synchronous code execution request', {
      executionId,
      language: submission.language,
      codeLength: submission.code.length,
      hasTestCases: (submission.testCases?.length ?? 0) > 0,
    });

    const executionPromise = async (): Promise<CodeExecutionResponse> => {
      const result = await executeCode(submission);
      let testResults = undefined;
      let allTestsPassed = undefined;

      if (submission.testCases && submission.testCases.length > 0) {
        testResults = await runTestCases(submission, submission.testCases);
        allTestsPassed = testResults.every((t) => t.passed);
      }

      return {
        success: true,
        executionId,
        result,
        testResults,
        allTestsPassed,
      };
    };

    const timeoutPromise = new Promise<CodeExecutionResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), SYNC_EXECUTION_TIMEOUT_MS);
    });

    const response = await Promise.race([executionPromise(), timeoutPromise]);

    logger.info('Synchronous execution completed', {
      executionId,
      exitCode: response.result?.exitCode,
      executionTimeMs: response.result?.executionTimeMs,
    });

    res.status(200).json(response);
  } catch (err) {
    const error = err as Error;
    logger.error('Synchronous execution error', { executionId, error: error.message });

    const isTimeout = error.message === 'Request timeout';
    res.status(isTimeout ? 408 : 500).json({
      success: false,
      executionId,
      error: isTimeout
        ? `Execution timed out after ${SYNC_EXECUTION_TIMEOUT_MS / 1000} seconds`
        : 'Internal server error during code execution',
    } satisfies CodeExecutionResponse);
  }
}

export async function executeAsync(req: Request, res: Response): Promise<void> {
  try {
    const parsed = CodeSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.errors.map((e) => e.message).join('; '),
      });
      return;
    }

    const submission = parsed.data;
    logger.info('Async code execution request', {
      language: submission.language,
      codeLength: submission.code.length,
    });

    const executionId = await addExecutionJob(submission);

    res.status(202).json({
      success: true,
      executionId,
      message: 'Job queued. Poll /api/v1/execution/:id for results.',
    });
  } catch (err) {
    const error = err as Error;
    logger.error('Failed to queue execution job', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to queue code execution job',
    });
  }
}

export async function getExecution(req: Request, res: Response): Promise<void> {
  const rawId = req.params['id'];
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id) {
    res.status(400).json({ success: false, error: 'Execution ID is required' });
    return;
  }

  try {
    const job = await getJobResult(id);

    if (!job) {
      res.status(404).json({
        success: false,
        error: 'Execution not found',
      });
      return;
    }

    const allTestsPassed =
      job.testResults && job.testResults.length > 0
        ? job.testResults.every((t) => t.passed)
        : undefined;

    res.status(200).json({
      success: true,
      executionId: id,
      status: job.status,
      result: job.result,
      testResults: job.testResults,
      allTestsPassed,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });
  } catch (err) {
    const error = err as Error;
    logger.error('Failed to get execution result', { id, error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve execution result',
    });
  }
}

export function getLanguages(_req: Request, res: Response): void {
  const languages = Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => ({
    language: lang,
    fileExtension: config.fileExtension,
    dockerAvailable: config.dockerAvailable,
    supportsCompilation: Boolean(config.compileCmd),
  }));

  res.status(200).json({
    success: true,
    languages,
  });
}
