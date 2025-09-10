import mongoose from "mongoose";
import addressSchema from "./address.schema.js";

const guideSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    address : { type: addressSchema, required: true },
    languages: { type: [String], required: true },
    rating: { type: Number, min: 0, max: 5 },
    contactInfo: { type: String }
  },
  {
    timestamps: true,
  }
);

export const Guide = mongoose.model("Guide", guideSchema);
