import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

const SLOW_QUERY_THRESHOLD_MS = 100; // Define what constitutes a "slow" query

// Listen to queries and check duration for slow query detection
prisma.$on('query', (e) => {
  if (e.duration > SLOW_QUERY_THRESHOLD_MS) {
    logger.warn(`[Prisma] Slow Query Detected (${e.duration}ms) [Target: ${e.target}] | Query: ${e.query}`);
  }
});

// Pipe Prisma logs to Winston
prisma.$on('error', (e) => logger.error(`[Prisma] ${e.message}`));
prisma.$on('warn', (e) => logger.warn(`[Prisma] ${e.message}`));
prisma.$on('info', (e) => logger.info(`[Prisma] ${e.message}`));

export default prisma;
