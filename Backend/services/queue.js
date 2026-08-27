import Redis from "ioredis";
import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

export const connection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME || "",
  password: process.env.REDIS_PASSWORD || "",
  maxRetriesPerRequest: null,
});

export const mediaQueue = new Queue("media-processing", {
  connection,
  settings: {
    skipCheckRedisVersion: true,
  },
});
