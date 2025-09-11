import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token:     { type: String, required: true, unique: true }
}, { timestamps: true });

export const Token = mongoose.model('Token', tokenSchema);
