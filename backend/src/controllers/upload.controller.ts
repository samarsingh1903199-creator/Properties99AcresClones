import { Request, Response } from "express";
import { UploadApiResponse, UploadApiOptions } from "cloudinary";
import { cloudinary } from "../config/cloudinary.js";

function streamUpload(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) return reject(error ?? new Error("Upload failed"));
      resolve(result);
    });
    stream.end(buffer);
  });
}

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: "No files provided" });
    return;
  }

  const results = await Promise.all(
    files.map((file) => {
      const isVideo = file.mimetype.startsWith("video/");
      return streamUpload(file.buffer, {
        folder:        "luxury-real-estate",
        resource_type: isVideo ? "video" : "image",
        transformation: isVideo
          ? undefined
          : [{ quality: "auto", fetch_format: "auto" }],
      });
    })
  );

  res.json({
    success: true,
    data: results.map((r) => ({
      url:          r.secure_url,
      publicId:     r.public_id,
      resourceType: r.resource_type,
      width:        r.width,
      height:       r.height,
      bytes:        r.bytes,
      format:       r.format,
    })),
  });
}

export async function deleteMedia(req: Request, res: Response): Promise<void> {
  const { publicId, resourceType } = req.body as { publicId: string; resourceType?: string };

  if (!publicId) {
    res.status(400).json({ success: false, message: "publicId is required" });
    return;
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: (resourceType === "video" ? "video" : "image") as "image" | "video",
  });

  res.json({ success: true, data: result });
}
