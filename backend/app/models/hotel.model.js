import mongoose from 'mongoose';
import addressSchema from './address.schema.js';

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    type: {type:String, enum : ['Hotel', 'Restaurent']},
    address: { type: addressSchema, required: true },
    image: { type: String, default: "" },
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
    description: { type: String }
}, {
    timestamps: true
});

hotelSchema.index({ location: "2dsphere" });

export const Hotel = mongoose.model('Hotel', hotelSchema);