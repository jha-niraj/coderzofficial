import IORedis from 'ioredis';
import logger from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: IORedis | null = null;

function createRedisClient(): IORedis {
  const client = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  client.on('connect', () => {
    logger.info('Redis client connected', { url: REDIS_URL });
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('error', (err: Error) => {
    logger.error('Redis client error', { error: err.message });
  });

  client.on('close', () => {
    logger.warn('Redis client connection closed');
  });

  client.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
  });

  return client;
}

export function getRedisClient(): IORedis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

export default getRedisClient;
