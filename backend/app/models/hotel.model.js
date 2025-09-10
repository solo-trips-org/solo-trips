import mongoose from 'mongoose';
import addressSchema from './address.schema.js';
import locationSchema from './location.schema.js';

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    type: {type:String, enum : ['Hotel', 'Restaurent']},
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
    description: { type: String },
    rating: { type: Number, min: 0, max: 5 }
}, {
    timestamps: true
});

export const Hotel = mongoose.model('Hotel', hotelSchema);