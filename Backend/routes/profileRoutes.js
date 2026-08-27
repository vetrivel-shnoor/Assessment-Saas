import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { PersonalInfo, uploadProfilePicture } from "../controllers/profileControllers.js";

const router = express.Router();

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    // Unique suffix to prevent filename collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

// --- ROUTES ---

// 1. Text Info Update
router.put("/info", protect(), PersonalInfo);

// 2. Profile Picture Update (with Multer middleware)
router.post(
  "/profile-image",
  protect(),
  upload.single("image"), // Looks for form-data field named 'image'
  uploadProfilePicture
);

export default router;
