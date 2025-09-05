import mongoose from 'mongoose';


const guideRatingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
},{
    timestamps: true
});

guideRatingSchema.index({ userId: 1, guideId: 1 }, { unique: true }); 

export const GuideRating =  mongoose.model('GuideRating', guideRatingSchema);

const placeRatingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
},{
    timestamps: true
});

placeRatingSchema.index({ userId: 1, placeId: 1 }, { unique: true }); 

export const PlaceRating = mongoose.model('PlaceRating', placeRatingSchema);


const eventRatingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
},{
    timestamps: true
});

eventRatingSchema.index({ userId: 1, eventId: 1 }, { unique: true });
export const EventRating = mongoose.model('EventRating', eventRatingSchema);