import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    address: { type: String, required: true },
    lat: { type: Number },
    lon: { type: Number },
},{
    timestamps: true
});

export const Event = mongoose.model('Event', eventSchema);