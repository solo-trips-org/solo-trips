import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
 lat: { type: Number, required: true },
 lon: { type: Number, required: true }
}, { _id: false });

const placeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: { type: locationSchema, required: true },
    openingHours: { type: String },
    description: { type: String },
    category: { type: String },
},{
    timestamps: true
});

export const Place = mongoose.model('Place', placeSchema);