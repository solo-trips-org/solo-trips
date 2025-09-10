import mongoose from 'mongoose';
import addressSchema from './address.schema.js';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    address: { type: String, required: true },
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
    }
},{
    timestamps: true
});

export const Event = mongoose.model('Event', eventSchema);