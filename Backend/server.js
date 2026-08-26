import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './config/logger.js';
import prisma from './config/prisma.js';
import redis from './config/redis.js';
import minioClient from './config/minio.js';
import connectMongo from './config/mongoose.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup morgan to pipe HTTP logs to winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend server is running smoothly',
  });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Startup Function
const startServer = async () => {
  try {
    // 1a. Test Prisma (SQL) Connection
    await prisma.$connect();
    logger.info('[Prisma] Successfully connected to PostgreSQL');
  } catch (error) {
    logger.error(`[Prisma] Failed to connect to PostgreSQL: ${error.message}`);
    process.exit(1);
  }

  // 1b. Test Mongoose (MongoDB) Connection
  await connectMongo();

  try {
    // 2. Test Redis Connection
    await redis.ping();
    logger.info('[Redis] Successfully connected');
  } catch (error) {
    logger.error(`[Redis] Failed to connect: ${error.message}`);
    // Don't exit on redis failure by default, just log it.
  }

  try {
    // 3. Test MinIO Connection (using listBuckets as a ping equivalent)
    await minioClient.listBuckets();
    logger.info('[MinIO] Successfully connected');
  } catch (error) {
    logger.error(`[MinIO] Failed to connect: ${error.message}`);
    // Don't exit on minio failure by default, just log it.
  }

  app.listen(PORT, () => {
    logger.info(`[Server] Running on http://localhost:${PORT}`);
  });
};

startServer();
