import { Hotel } from "../models/hotel.model.js";

export const getNearbyHotels = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters" });
    }

    const hotels = await Hotel.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            parseFloat(radius) / 6378.1,
          ], // radius in miles
        },
      },
    });
    res.status(200).json(hotels);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching nearby hotels", error: err.message });
  }
};
