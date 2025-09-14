import { Hotel } from "../models/hotel.model.js";
import { HotelRating } from "../models/rating.model.js";

export const getNearbyHotels = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const dist = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(dist)) {
      return res
        .status(400)
        .json({ message: "latitude, longitude, and radius must be numbers" });
    }

    // 1️⃣ Find nearby hotels
    const hotels = await Hotel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], dist / 6378.1], // radius in km
        },
      },
    });

    // 2️⃣ Append average rating for each hotel
    const hotelsWithRatings = await Promise.all(
      hotels.map(async (hotel) => {
        const avgResult = await HotelRating.aggregate([
          { $match: { hotelId: hotel._id } },
          { $group: { _id: null, avg: { $avg: "$score" } } },
        ]);
        const averageRating = avgResult.length > 0 ? avgResult[0].avg : 0;
        return {
          ...hotel.toObject(),
          averageRating,
        };
      })
    );

    res.status(200).json({ success: true, hotels: hotelsWithRatings });
  } catch (err) {
    console.error("Nearby Hotels Error:", err);
    res
      .status(500)
      .json({ message: "Error fetching nearby hotels", error: err.message });
  }
};
