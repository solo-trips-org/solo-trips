import { Place } from "../models/place.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Event } from "../models/event.model.js";
import { Guide } from "../models/guide.model.js";

export const globalSearch = async (req, res) => {
  try {
    const {
      q,
      category,
      type,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      city,
      language
    } = req.query;

    const regex = q ? new RegExp(q, "i") : null;

    // ---------- Place filter ----------
    const placeFilter = {};
    if (regex) {
      placeFilter.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }
    if (category) {
      placeFilter.category = category;
    }
    if (minPrice || maxPrice) {
      placeFilter["fees.amount"] = {};
      if (minPrice) placeFilter["fees.amount"].$gte = parseFloat(minPrice);
      if (maxPrice) placeFilter["fees.amount"].$lte = parseFloat(maxPrice);
    }
    if (city) {
      placeFilter["address.city"] = new RegExp(city, "i");
    }

    // ---------- Hotel filter ----------
    const hotelFilter = {};
    if (regex) {
      hotelFilter.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }
    if (type) {
      hotelFilter.type = type; // "Hotel" or "Restaurent"
    }
    if (city) {
      hotelFilter["address.city"] = new RegExp(city, "i");
    }

    // ---------- Event filter ----------
    const eventFilter = {};
    if (regex) {
      eventFilter.$or = [{ title: regex }, { description: regex }];
    }
    if (startDate || endDate) {
      eventFilter["schedule.startDate"] = {};
      if (startDate) eventFilter["schedule.startDate"].$gte = new Date(startDate);
      if (endDate) eventFilter["schedule.startDate"].$lte = new Date(endDate);
    }
    if (city) {
      eventFilter["address.city"] = new RegExp(city, "i");
    }

    // ---------- Guide filter ----------
    const guideFilter = {};
    if (regex) {
      guideFilter.$or = [{ name: regex }, { languages: regex },{ "address.city": regex }];
    }
    if (city) {
      guideFilter["address.city"] = new RegExp(city, "i");
    }
    if (language) {
      guideFilter.languages = { $regex: new RegExp(language, "i") };
    }

    const [places, hotels, events, guides] = await Promise.all([
      Place.find(placeFilter).limit(20),
      Hotel.find(hotelFilter).limit(20),
      Event.find(eventFilter).limit(20),
      Guide.find(guideFilter).limit(20),
    ]);

    res.json({
      query: q || "",
      filters: { category, type, minPrice, maxPrice, startDate, endDate, city, language },
      results: { places, hotels, events, guides },
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
};
