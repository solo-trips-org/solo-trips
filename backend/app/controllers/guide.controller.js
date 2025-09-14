import { Guide } from "../models/guide.model.js";
import { GuideRating } from "../models/rating.model.js";

// GET /api/guides/search?city=Jaffna&gender=male&language=Tamil
export const getNearbyGuides = async (req, res) => {
  try {
    const { city, gender, language } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City is required for search" });
    }

    // Build search filter
    const filter = { "address.city": city };
    if (gender) filter.gender = gender;
    if (language) filter.languages = language; // matches any language in array

    // 1️⃣ Find matching guides
    const guides = await Guide.find(filter);

    if (guides.length === 0) {
      return res
        .status(404)
        .json({ message: "No guides found in this city matching criteria" });
    }

    // 2️⃣ Append average rating for each guide
    const guidesWithRatings = await Promise.all(
      guides.map(async (guide) => {
        const avgResult = await GuideRating.aggregate([
          { $match: { guideId: guide._id } },
          { $group: { _id: null, avg: { $avg: "$score" } } },
        ]);
        const averageRating = avgResult.length > 0 ? avgResult[0].avg : 0;
        return {
          ...guide.toObject(),
          averageRating,
        };
      })
    );

    res.status(200).json({ success: true, guides: guidesWithRatings });
  } catch (err) {
    console.error("Nearby Guides Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};
