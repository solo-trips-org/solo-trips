import { Place } from "../models/place.model.js";
import { PlaceRating } from "../models/rating.model.js";

export const getNearbyPlaces = async (req, res) => {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng || !radius) {
        return res.status(400).json({ error: "lat, lng, and radius are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distance = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
        return res.status(400).json({ error: "lat, lng, and radius must be valid numbers" });
    }

    try {
        // 1️⃣ Find nearby places
        const places = await Place.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[longitude, latitude], distance / 6378.1] // radius in km
                }
            }
        });

        // 2️⃣ Append average rating for each place
        const placesWithRatings = await Promise.all(
            places.map(async (place) => {
                const avgResult = await PlaceRating.aggregate([
                    { $match: { placeId: place._id } },
                    { $group: { _id: null, avg: { $avg: "$score" } } }
                ]);
                const averageRating = avgResult.length > 0 ? avgResult[0].avg : 0;
                return {
                    ...place.toObject(),
                    averageRating
                };
            })
        );

        res.status(200).json({ success: true, places: placesWithRatings });
    } catch (error) {
        console.error("Nearby Places Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
