import { Place } from "../models/place.model.js";

export const getNearbyPlaces = async (req, res) => {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng || !radius) {
        return res.status(400).json({ "error": "lat, lng, and radius are required" });
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distance = parseFloat(radius);
    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
        return res.status(400).json({ "error": "lat, lng, and radius must be valid numbers" });
    }
    try {
        const places = await Place.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[longitude, latitude], distance / 6378.1]
                }
            }
        });
        res.status(200).json({ "success": "true", "places": places });
    } catch {
        res.status(500).json({ "error": "Internal Server Error" });
    }
};