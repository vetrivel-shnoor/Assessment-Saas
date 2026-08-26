import Redis from 'ioredis';
import logger from './logger.js';

// Base configuration with advanced connection pooling settings
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  username: process.env.REDIS_USERNAME || undefined,
  
  // By default, BullMQ might need a specific DB, cache might need another. 
  // We'll expose the primary DB here, but other modules can pass a different db parameter if needed.
  db: process.env.REDIS_DB_CACHE ? parseInt(process.env.REDIS_DB_CACHE, 10) : 0,

  // Advanced Connection pooling / resiliency configs
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
  retryStrategy(times) {
    // Reconnect after
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

const redis = new Redis(redisConfig);

redis.on('error', (err) => {
  logger.error(`[Redis] Connection Error: ${err.message}`);
});

export default redis;
