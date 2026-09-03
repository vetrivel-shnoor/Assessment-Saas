import { Worker } from "bullmq";
import prisma from "../config/prisma.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { connection } from "../services/queue.js";
import minioClient from "../config/minio.js";
import hotcache from "../utils/hotcache.js";

// 1. DISABLE SHARP CACHE
sharp.cache(false);

const USE_MINIO = process.env.USE_MINIO === "true";
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'icuman';

/**
 * Helper: Aggressively clean .fuse_hidden files
 */
const cleanStaleFuseFiles = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    let deletedCount = 0;
    files.forEach((file) => {
      if (file.startsWith(".fuse_hidden") || file.startsWith("profile-") || file.startsWith("users-")) {
        const fullPath = path.join(dirPath, file);
        try {
          fs.unlinkSync(fullPath);
          deletedCount++;
        } catch (err) {
          /* Ignore locks */
        }
      }
    });
    if (deletedCount > 0) {
      console.log(`[Worker] [Nuke] Removed ${deletedCount} stale files from ${dirPath}`);
    }
  } catch (err) {
    console.warn(`[Worker] [Warning] Cleanup scan failed: ${err.message}`);
  }
};

export const worker = new Worker(
  "media-processing",
  async (job) => {
    const { fileId, filePath, modelName, fieldName } = job.data;
    
    // Support dynamic models like the example
    const prismaModel = prisma[modelName.toLowerCase()];
    if (!prismaModel) throw new Error(`Prisma model '${modelName}' not found`);

    // Ensure we have absolute path to local file (uploaded by Multer)
    let inputPath = filePath;
    if (!path.isAbsolute(inputPath)) {
      inputPath = path.resolve(process.cwd(), inputPath);
    }

    console.log(`[Worker] [Start Job] ${modelName} ID: ${fileId} | Storage: ${USE_MINIO ? "MinIO" : "Local"}`);

    let newResultPath = null;

    try {
      // 2. Validate Local File
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Local file missing at ${inputPath}`);
      }

      // 3. Process Image
      const processedBuffer = await sharp(inputPath)
        .resize(500, 500, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const timestamp = Date.now();
      const folderName = `public/${modelName.toLowerCase()}`;
      const fileName = `${fileId}-${timestamp}`;

      // 4. Upload Logic
      if (USE_MINIO) {
        newResultPath = `/${folderName}/${fileName}.webp`;
        await minioClient.putObject(
          BUCKET_NAME,
          `${folderName}/${fileName}.webp`,
          processedBuffer,
          processedBuffer.length,
          { "Content-Type": "image/webp" }
        );
        console.log(`[Worker] [MinIO] Uploaded: ${newResultPath}`);
      } else {
        // Fallback local saving if Minio is off
        const absoluteOutputDir = path.resolve(process.cwd(), folderName);
        if (!fs.existsSync(absoluteOutputDir)) {
          fs.mkdirSync(absoluteOutputDir, { recursive: true });
        }
        const finalFilename = `${fileName}.webp`;
        const absoluteFinalPath = path.join(absoluteOutputDir, finalFilename);
        fs.writeFileSync(absoluteFinalPath, processedBuffer);
        newResultPath = `/${folderName}/${finalFilename}`;
        console.log(`[Worker] [Local] Saved: ${newResultPath}`);
      }

      // 5. Fetch Old Record
      const existingDoc = await prismaModel.findUnique({
        where: { id: fileId },
      });
      const oldPath = existingDoc ? existingDoc[fieldName] : null;

      // 6. Update DB
      await prismaModel.update({
        where: { id: fileId },
        data: { [fieldName]: newResultPath },
      });
      console.log(`[Worker] [DB] Database updated for ${fileId}`);

      if (modelName.toLowerCase() === 'users') {
        await hotcache.invalidateUserProfile(fileId);
      }
      if (job.data.uploaderId) {
        await hotcache.invalidateUserProfile(job.data.uploaderId);
      }

      // 7. Cleanup Old Image
      if (oldPath && oldPath !== newResultPath) {
        const isUrl = oldPath.startsWith("http");
        // Convert old path like /public/users/x.webp to minio object public/users/x.webp
        let minioObjectPath = oldPath.startsWith('/') ? oldPath.slice(1) : oldPath;
        if (USE_MINIO && !isUrl) {
          try {
            await minioClient.removeObject(BUCKET_NAME, minioObjectPath);
            console.log(`[Worker] [MinIO] Deleted old image: ${oldPath}`);
          } catch (e) {
            console.warn(`[Worker] MinIO delete failed: ${e.message}`);
          }
        } else if (!USE_MINIO && !isUrl) {
           const oldLocalPath = path.join(process.cwd(), minioObjectPath);
           if (fs.existsSync(oldLocalPath)) {
              fs.unlinkSync(oldLocalPath);
              console.log(`[Worker] [Local] Deleted old image: ${oldPath}`);
           }
        }
      }

      return newResultPath;
    } catch (error) {
      console.error(`[Worker] [Error] Job Failed: ${error.message}`);
      
      // Rollback logic
      if (USE_MINIO && newResultPath) {
        try {
          const rollbackPath = newResultPath.startsWith('/') ? newResultPath.slice(1) : newResultPath;
          await minioClient.removeObject(BUCKET_NAME, rollbackPath);
        } catch (e) {}
      }
      throw error;
    } finally {
      // 8. Local Cleanup (Input file from multer)
      try {
        if (fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
          console.log(`[Worker] [Cleanup] Local temp file cleaned.`);
        }
      } catch (err) {
        console.warn(`[Worker] Failed to delete temp file: ${err.message}`);
      }
      
      // 9. Fuse Cleanup
      cleanStaleFuseFiles(path.dirname(inputPath));
    }
  },
  {
    connection,
    removeOnComplete: { count: 0 },
    removeOnFail: { count: 20 },
  }
);

// --- 10. Startup Cleanup ---
const startUpCleanupPath = path.resolve(process.cwd(), "public/uploads");
if (fs.existsSync(startUpCleanupPath)) {
  console.log("[Worker] [Startup] Scanning for stale files...");
  cleanStaleFuseFiles(startUpCleanupPath);
}

console.log("Media Worker is running...");
