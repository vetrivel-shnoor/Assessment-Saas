import { mediaQueue } from "./queue.js";

/**
 * Adds a media processing job to the queue.
 * @param {Object} file - The file object from Multer.
 * @param {String} fileId - The ID of the database document to update (User ID or Gallery ID).
 * @param {String} modelName - The Prisma model name (e.g. "users").
 * @param {String} fieldName - The field in the model to update (e.g. "profilePicture").
 */
export const enqueueMedia = async (file, fileId, modelName, fieldName, uploaderId = null) => {
  await mediaQueue.add("process-media", {
    fileId,
    filePath: file.path,
    mimeType: file.mimetype,
    outputDir: "public/uploads/",
    modelName,
    fieldName,
    uploaderId,
  });
};
