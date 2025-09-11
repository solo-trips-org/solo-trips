import { PlaceRating, HotelRating, GuideRating, EventRating } from "../models/rating.model.js";

export const addPlaceRating = async (req, res) => {
    const { userId, placeId, score } = req.body;
    if (!userId || !placeId || !score) {
        return res.status(400).json({ "error": "userId, placeId, and score are required" });
    }
    try {
        const newRating = new PlaceRating({ userId, placeId, score });
        await newRating.save();
        res.status(201).json({ "success": "true", data: newRating });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ "error": "User has already rated this place" });
        }
        res.status(500).json({ "error": "Internal Server Error" });
    }
};

export const addHotelRating = async (req, res) => {
    const { userId, hotelId, score } = req.body;
    if (!userId || !hotelId || !score) {
        return res.status(400).json({ "error": "userId, hotelId, and score are required" });
    }
    try {
        const newRating = new HotelRating({ userId, hotelId, score });
        await newRating.save();
        res.status(201).json({ "success": "true", data: newRating });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ "error": "User has already rated this hotel" });
        }
        res.status(500).json({ "error": "Internal Server Error" });
    }
};

export const addGuideRating = async (req, res) => {
    const { userId, guideId, score } = req.body;
    if (!userId || !guideId || !score) {
        return res.status(400).json({ "error": "userId, guideId, and score are required" });
    }
    try {
        const newRating = new GuideRating({ userId, guideId, score });
        await newRating.save();
        res.status(201).json({ "success": "true", data: newRating });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ "error": "User has already rated this guide" });
        }
        res.status(500).json({ "error": "Internal Server Error" });
    }
};

export const addEventRating = async (req, res) => {
    const { userId, eventId, score } = req.body;
    if (!userId || !eventId || !score) {
        return res.status(400).json({ "error": "userId, eventId, and score are required" });
    }
    try {
        const newRating = new EventRating({ userId, eventId, score });
        await newRating.save();
        res.status(201).json({ "success": "true", data: newRating });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ "error": "User has already rated this event" });
        }
        res.status(500).json({ "error": "Internal Server Error" });
    }
};