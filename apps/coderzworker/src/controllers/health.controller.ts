import type { Request, Response } from 'express';
import os from 'os';

const DOCKER_ENABLED = process.env.DOCKER_ENABLED !== 'false';

export function healthCheck(_req: Request, res: Response): void {
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
    },
    docker: DOCKER_ENABLED,
    version: process.env.npm_package_version ?? '1.0.0',
    nodeVersion: process.version,
  });
}
