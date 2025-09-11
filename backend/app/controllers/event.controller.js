import { Event } from "../models/event.model.js";

export const getNearbyEvents = async (req, res) => {
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
        const now = new Date();

        const events = await Event.find({
            "schedule.to": { $gte: now }, // event still ongoing or upcoming
            location: {
                $geoWithin: {
                    $centerSphere: [[longitude, latitude], distance / 6378.1] // radius in km
                }
            }
        }).sort({ "schedule.from": 1 }); // soonest events first

        if (!events || events.length === 0) {
            return res.status(200).json({ success: true, message: "No upcoming events available in this area." });
        }

        res.status(200).json({ success: true, events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};
