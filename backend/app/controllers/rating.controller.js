import { PlaceRating, HotelRating, GuideRating, EventRating } from "../models/rating.model.js";

// 🔹 Generic Add/Update Handler
const addOrUpdateRating = async (Model, uniqueFields, req, res) => {
  try {
    const userId = req.user?.id;
    const { score } = req.body;

    if (!userId || !score || Object.values(uniqueFields).some((v) => !v)) {
      return res.status(400).json({ error: "userId, targetId, and score are required" });
    }

    const updatedRating = await Model.findOneAndUpdate(
      { userId, ...uniqueFields },
      { userId, ...uniqueFields, score },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: updatedRating });
  } catch (error) {
    console.error("Rating Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔹 Generic Fetch Handler with meta + pagination enforcement + limit safety
const fetchRatings = async (Model, filterField, id, req, res) => {
  try {
    if (!id) return res.status(400).json({ error: `${filterField} is required` });

    let { page, limit, userId } = req.query;
    let parsedPage = parseInt(page || "1", 10);
    let parsedLimit = parseInt(limit || "0", 10);

    // Ensure limit is safe
    if (parsedLimit > 50) parsedLimit = 50;
    if (parsedLimit < 0) parsedLimit = 0;

    // Count all ratings first
    const total = await Model.countDocuments({ [filterField]: id });

    // 🚨 Enforce pagination if more than 50 records
    if (!page && !limit && total > 50) {
      return res.status(400).json({
        success: false,
        message: "Pagination required when records exceed 50",
        total,
      });
    }

    const skip = parsedLimit > 0 ? (parsedPage - 1) * parsedLimit : 0;

    // Fetch ratings (apply pagination only if limit > 0)
    const ratingsQuery = Model.find({ [filterField]: id }).sort({ createdAt: -1 });
    if (parsedLimit > 0) {
      ratingsQuery.skip(skip).limit(parsedLimit);
    }

    const ratings = await ratingsQuery;

    // Calculate average score
    const avgResult = await Model.aggregate([
      { $match: { [filterField]: id } },
      { $group: { _id: null, avg: { $avg: "$score" } } },
    ]);
    const average = avgResult.length > 0 ? avgResult[0].avg : 0;

    // Get user's rating if requested
    let userRating = null;
    if (userId) {
      userRating = await Model.findOne({ [filterField]: id, userId });
    }

    res.status(200).json({
      success: true,
      meta: {
        totalRecords: total,
        average,
        page: parsedLimit > 0 ? parsedPage : null,
        totalPages: parsedLimit > 0 ? Math.ceil(total / parsedLimit) : null,
        perPage: parsedLimit > 0 ? parsedLimit : null,
      },
      userRating,
      data: ratings,
    });
  } catch (error) {
    console.error("Fetch Rating Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- Place Rating ---
export const addPlaceRating = (req, res) => {
  addOrUpdateRating(PlaceRating, { placeId: req.body.placeId }, req, res);
};
export const getPlaceRatings = (req, res) => {
  fetchRatings(PlaceRating, "placeId", req.params.placeId, req, res);
};

// --- Hotel Rating ---
export const addHotelRating = (req, res) => {
  addOrUpdateRating(HotelRating, { hotelId: req.body.hotelId }, req, res);
};
export const getHotelRatings = (req, res) => {
  fetchRatings(HotelRating, "hotelId", req.params.hotelId, req, res);
};

// --- Guide Rating ---
export const addGuideRating = (req, res) => {
  addOrUpdateRating(GuideRating, { guideId: req.body.guideId }, req, res);
};
export const getGuideRatings = (req, res) => {
  fetchRatings(GuideRating, "guideId", req.params.guideId, req, res);
};

// --- Event Rating ---
export const addEventRating = (req, res) => {
  addOrUpdateRating(EventRating, { eventId: req.body.eventId }, req, res);
};
export const getEventRatings = (req, res) => {
  fetchRatings(EventRating, "eventId", req.params.eventId, req, res);
};
