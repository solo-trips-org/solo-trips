import { User } from "../models/user.model.js";
import { Place } from "../models/place.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Guide } from "../models/guide.model.js";
import { Event } from "../models/event.model.js";
import {
  PlaceRating,
  HotelRating,
  GuideRating,
  EventRating,
} from "../models/rating.model.js";

export const getDashboardAnalytics = async (req, res) => {
  try {
    // total counts
    const totalUsers = await User.countDocuments();
    const totalPlaces = await Place.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalGuides = await Guide.countDocuments();
    const totalEvents = await Event.countDocuments();

    // average ratings
    const avgPlaceRating =
      (
        await PlaceRating.aggregate([
          { $group: { _id: null, avg: { $avg: "$score" } } },
        ])
      )[0]?.avg || 0;

    const avgHotelRating =
      (
        await HotelRating.aggregate([
          { $group: { _id: null, avg: { $avg: "$score" } } },
        ])
      )[0]?.avg || 0;

    const avgGuideRating =
      (
        await GuideRating.aggregate([
          { $group: { _id: null, avg: { $avg: "$score" } } },
        ])
      )[0]?.avg || 0;

    const avgEventRating =
      (
        await EventRating.aggregate([
          { $group: { _id: null, avg: { $avg: "$score" } } },
        ])
      )[0]?.avg || 0;

    // last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const recentPlaces = await Place.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const recentHotels = await Hotel.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const recentEvents = await Event.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      totals: {
        users: totalUsers,
        places: totalPlaces,
        hotels: totalHotels,
        guides: totalGuides,
        events: totalEvents,
      },
      ratings: {
        places: avgPlaceRating.toFixed(2),
        hotels: avgHotelRating.toFixed(2),
        guides: avgGuideRating.toFixed(2),
        events: avgEventRating.toFixed(2),
      },
      recent: {
        newUsers: recentUsers,
        newPlaces: recentPlaces,
        newHotels: recentHotels,
        newEvents: recentEvents,
      },
    });
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
