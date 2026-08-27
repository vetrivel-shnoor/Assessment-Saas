import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import logger from './config/logger.js';
import prisma from './config/prisma.js';
import redis from './config/redis.js';
import minioClient from './config/minio.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import passportConfig from './config/passport.js';
import path from 'path';

// Start background workers
import './workers/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Setup morgan to pipe HTTP logs to winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Initialize Passport
app.use(passport.initialize());
passportConfig(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

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
