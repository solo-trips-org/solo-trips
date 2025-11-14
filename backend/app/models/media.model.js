// models/Media.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  url: { type: String }, // public URL or R2 signed URL
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Media", mediaSchema);