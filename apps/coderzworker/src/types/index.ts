export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'c';

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface CodeSubmission {
  code: string;
  language: SupportedLanguage;
  stdin?: string;
  testCases?: TestCase[];
  timeoutMs?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsedMb?: number;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  description?: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  executionId: string;
  result?: ExecutionResult;
  testResults?: TestCaseResult[];
  allTestsPassed?: boolean;
  error?: string;
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout';

export interface ExecutionJob {
  id: string;
  submission: CodeSubmission;
  status: JobStatus;
  result?: ExecutionResult;
  testResults?: TestCaseResult[];
  createdAt: Date;
  completedAt?: Date;
}
