// controllers/media.controller.js
import Media from "../models/media.model.js";
import { s3 } from "../../config/r2.js";
import multer from "multer";
import { nanoid } from "nanoid";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Multer storage in memory
export const uploadMiddleware = multer({ storage: multer.memoryStorage() });

// Upload Media
export const uploadMedia = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Optional folder param (from body or query)
    const { folder = "", public: isPublic = true, userId = null } = req.body;

    // Build full key with folder prefix if provided
    const key = folder
      ? `${folder.replace(/\/+$/, "")}/${nanoid()}-${file.originalname}`
      : `${nanoid()}-${file.originalname}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3.send(command);

    const media = await Media.create({
      filename: key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      public: isPublic,
      userId,
      url: `https://${process.env.R2_BUCKET}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`
    });

    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// List Media
export const listMedia = async (req, res) => {
  try {
    const { userId, publicOnly, folder } = req.query;

    let filter = {};
    if (userId) filter.userId = userId;
    if (publicOnly === "true") filter.public = true;
    if (folder) filter.filename = { $regex: `^${folder}/` };

    const mediaList = await Media.find(filter).sort({ createdAt: -1 });
    res.json(mediaList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
};

// Delete Media
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ error: "Media not found" });

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: media.filename,
    });
    await s3.send(command);

    await media.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};

// Get Private Media URL (signed URL)
export const getPrivateMediaUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ error: "Media not found" });

    if (media.public) {
      return res.json({ url: media.url });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: media.filename,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutes
    res.json({ url: signedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
};
