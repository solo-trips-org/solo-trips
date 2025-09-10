import mongoose from "mongoose";
import addressSchema from "./address.schema.js";

const feeSchema = new mongoose.Schema(
  {
    required: { type: Boolean, default: false },
    amount: { type: Number, default: 0 }, // currency amount (use decimals as needed)
    currency: { type: String, default: "LKR" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const visitTimeSchema = new mongoose.Schema(
  {
    minMinutes: { type: Number, default: 30 },
    maxMinutes: { type: Number, default: 90 },
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },

    address: { type: addressSchema, required: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    openingHours: { type: String, default: "" },

    fees: { type: feeSchema, default: () => ({}) },

    visitDuration: { type: visitTimeSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// 2dsphere index for geo queries
placeSchema.index({ location: "2dsphere" });

export const Place = mongoose.model("Place", placeSchema);
