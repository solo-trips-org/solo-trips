import mongoose from "mongoose";
import addressSchema from "./address.schema.js";
import scheduleSchema from "./schedule.schema.js";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    schedule: { type: scheduleSchema, required: true }, // <-- replaced `date`
    address: { type: addressSchema, required: true },
    image: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: true }
);

eventSchema.index({ location: "2dsphere" });

export const Event = mongoose.model("Event", eventSchema);