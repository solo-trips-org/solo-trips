import { Guide } from "../models/guide.model.js";

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

    const guides = await Guide.find(filter);

    if (guides.length === 0) {
      return res.status(404).json({ message: "No guides found in this city matching criteria" });
    }

    res.status(200).json({ success: true, guides });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};
