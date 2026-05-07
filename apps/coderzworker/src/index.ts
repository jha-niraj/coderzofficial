import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { startWorker } from './modules/compiler/queue';
import { closeRedisConnection } from './utils/redis';
import routes from './routes/index';
import logger from './utils/logger';

const PORT = parseInt(process.env.PORT ?? '3004', 10);
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const DOCKER_ENABLED = process.env.DOCKER_ENABLED !== 'false';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions: cors.CorsOptions =
  NODE_ENV === 'production'
    ? {
        origin: (origin, callback) => {
          // In production, allow requests only from trusted origins
          // Configure ALLOWED_ORIGINS env var as comma-separated list
          const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
          }
        },
        credentials: true,
      }
    : {
        origin: true, // Allow all in development
        credentials: true,
      };

app.use(cors(corsOptions));

// ─── BODY PARSER ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── REQUEST LOGGING ──────────────────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use(routes);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info('CoderzWorker service started', {
    port: PORT,
    nodeEnv: NODE_ENV,
    dockerEnabled: DOCKER_ENABLED,
    pid: process.pid,
  });

  if (!DOCKER_ENABLED) {
    logger.warn(
      'Docker is DISABLED — using child_process fallback. ' +
        'Only JavaScript and Python are supported. This is NOT production safe.'
    );
  }

  // Start the BullMQ worker for async jobs
  try {
    startWorker();
    logger.info('BullMQ worker initialized');
  } catch (err) {
    logger.warn('Failed to start BullMQ worker (Redis may be unavailable). Async /run endpoint will not work.', {
      error: (err as Error).message,
    });
  }
});

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await closeRedisConnection();
    } catch (err) {
      logger.error('Error closing Redis connection', { error: (err as Error).message });
    }

    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
});

export default app;
