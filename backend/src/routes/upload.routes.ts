import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.js";
import { uploadMedia, deleteMedia } from "../controllers/upload.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max per file
    files: 10,
  },
  fileFilter(_req, file, cb) {
    const allowed = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

function multerErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    return;
  }
  if (err instanceof Error) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }
  next(err);
}

const router = Router();

router.use(authenticate);

router.post(
  "/",
  upload.array("files", 10),
  multerErrorHandler,
  asyncHandler(uploadMedia)
);

router.delete("/", asyncHandler(deleteMedia));

export default router;
