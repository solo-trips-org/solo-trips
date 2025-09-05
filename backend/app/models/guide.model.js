import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bio: { type: String },
    languages: { type: [String], required: true },
    rating: { type: Number, min: 0, max: 5 },
    contactInfo: { type: String },
},{
    timestamps: true
});

export  const Guide =  mongoose.model('Guide', guideSchema);