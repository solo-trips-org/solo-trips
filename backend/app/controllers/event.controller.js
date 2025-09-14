import { Event } from "../models/event.model.js";
import { EventRating } from "../models/rating.model.js";

export const getNearbyEvents = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res
        .status(400)
        .json({ error: "lat, lng, and radius are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distance = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
      return res
        .status(400)
        .json({ error: "lat, lng, and radius must be valid numbers" });
    }

    const now = new Date();

    // 1️⃣ Find upcoming events within radius
    const events = await Event.find({
      "schedule.to": { $gte: now },
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], distance / 6378.1],
        },
      },
    }).sort({ "schedule.from": 1 }); // soonest first

    if (!events || events.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No upcoming events available in this area.",
      });
    }

    // 2️⃣ Append average rating for each event
    const eventsWithRatings = await Promise.all(
      events.map(async (event) => {
        const avgResult = await EventRating.aggregate([
          { $match: { eventId: event._id } },
          { $group: { _id: null, avg: { $avg: "$score" } } },
        ]);
        const averageRating = avgResult.length > 0 ? avgResult[0].avg : 0;
        return {
          ...event.toObject(),
          averageRating,
        };
      })
    );

    res.status(200).json({ success: true, events: eventsWithRatings });
  } catch (err) {
    console.error("Nearby Events Error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};
