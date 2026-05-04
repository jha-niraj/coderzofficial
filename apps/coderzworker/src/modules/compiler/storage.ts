import type { ExecutionJob } from '../../types/index.js';

const jobStore = new Map<string, ExecutionJob>();
const CLEANUP_AGE_MS = 10 * 60 * 1000; // 10 minutes

export function storeResult(jobId: string, job: ExecutionJob): void {
  jobStore.set(jobId, job);
}

export function getResult(jobId: string): ExecutionJob | undefined {
  return jobStore.get(jobId);
}

export function cleanupOldResults(): void {
  const now = Date.now();
  let removed = 0;

  for (const [id, job] of jobStore.entries()) {
    const age = now - job.createdAt.getTime();
    if (age > CLEANUP_AGE_MS) {
      jobStore.delete(id);
      removed++;
    }
  }

  if (removed > 0) {
    // Use console here to avoid circular imports with logger
    console.log(`[storage] Cleaned up ${removed} old job result(s)`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupOldResults, 5 * 60 * 1000);
