import { Queue, Worker, type Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import type { CodeSubmission, ExecutionJob } from '../../types/index';
import { executeCode, runTestCases } from './executor';
import { storeResult, getResult } from './storage';
import getRedisClient from '../../utils/redis';
import logger from '../../utils/logger';

const QUEUE_NAME = 'code-execution';

let executionQueue: Queue | null = null;
let executionWorker: Worker | null = null;

function getQueue(): Queue {
  if (!executionQueue) {
    const connection = getRedisClient();
    executionQueue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: {
          age: 5 * 60, // 5 minutes in seconds
        },
        removeOnFail: {
          age: 10 * 60, // 10 minutes in seconds
        },
      },
    });

    executionQueue.on('error', (err: Error) => {
      logger.error('Queue error', { error: err.message });
    });
  }
  return executionQueue;
}

function startWorker(): Worker {
  if (!executionWorker) {
    const connection = getRedisClient();
    executionWorker = new Worker(
      QUEUE_NAME,
      async (job: Job<CodeSubmission>) => {
        const submission = job.data;
        const jobId = job.id ?? uuidv4();

        logger.info('Processing code execution job', { jobId, language: submission.language });

        // Mark as running
        const runningJob: ExecutionJob = {
          id: jobId,
          submission,
          status: 'running',
          createdAt: new Date(job.timestamp),
        };
        storeResult(jobId, runningJob);

        try {
          const result = await executeCode(submission);
          let testResults = undefined;

          if (submission.testCases && submission.testCases.length > 0) {
            testResults = await runTestCases(submission, submission.testCases);
          }

          const completedJob: ExecutionJob = {
            ...runningJob,
            status: 'completed',
            result,
            testResults,
            completedAt: new Date(),
          };
          storeResult(jobId, completedJob);

          logger.info('Job completed', { jobId, exitCode: result.exitCode });
          return { result, testResults };
        } catch (err) {
          const error = err as Error;
          logger.error('Job failed', { jobId, error: error.message });

          const isTimeout = error.message.includes('timeout') || error.message.includes('timed out');
          const failedJob: ExecutionJob = {
            ...runningJob,
            status: isTimeout ? 'timeout' : 'failed',
            completedAt: new Date(),
          };
          storeResult(jobId, failedJob);

          throw err;
        }
      },
      {
        connection,
        concurrency: 5,
      }
    );

    executionWorker.on('completed', (job: Job) => {
      logger.debug('Worker completed job', { jobId: job.id });
    });

    executionWorker.on('failed', (job: Job | undefined, err: Error) => {
      logger.error('Worker failed job', { jobId: job?.id, error: err.message });
    });

    executionWorker.on('error', (err: Error) => {
      logger.error('Worker error', { error: err.message });
    });

    logger.info('BullMQ code execution worker started');
  }

  return executionWorker;
}

export async function addExecutionJob(submission: CodeSubmission): Promise<string> {
  const queue = getQueue();
  const jobId = uuidv4();

  // Pre-store with pending status
  const pendingJob: ExecutionJob = {
    id: jobId,
    submission,
    status: 'pending',
    createdAt: new Date(),
  };
  storeResult(jobId, pendingJob);

  await queue.add('execute', submission, {
    jobId,
  });

  logger.info('Queued code execution job', { jobId, language: submission.language });
  return jobId;
}

export async function getJobResult(jobId: string): Promise<ExecutionJob | null> {
  const stored = getResult(jobId);
  if (stored) {
    return stored;
  }

  // Check BullMQ directly if not in memory storage
  const queue = getQueue();
  const job = await queue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const statusMap: Record<string, ExecutionJob['status']> = {
    waiting: 'pending',
    active: 'running',
    completed: 'completed',
    failed: 'failed',
    delayed: 'pending',
    prioritized: 'pending',
    'wait-children': 'pending',
    unknown: 'pending',
  };

  return {
    id: jobId,
    submission: job.data,
    status: statusMap[state] ?? 'pending',
    createdAt: new Date(job.timestamp),
  };
}

export { getQueue as executionQueue, startWorker };
