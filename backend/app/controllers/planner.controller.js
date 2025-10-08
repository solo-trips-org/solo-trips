import { Place } from "../models/place.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Event } from "../models/event.model.js";
import History from "../models/histrory.model.js";

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

export const generateTripPlan = async (req, res) => {
  try {
    const { 
      fromPlace, 
      toPlace, 
      wayPoints = [], 
      personCount = 1, 
      daysOfTrip = 1, 
      startTimestamp, 
      endTimestamp 
    } = req.body;

    // Fetch selected places
    const selectedPlaces = await Place.find({
      _id: { $in: [fromPlace, toPlace, ...wayPoints] }
    });

    if (selectedPlaces.length === 0) {
      return res.status(404).json({ message: "Places not found" });
    }

    // Order main path
    const orderedPlaces = [
      selectedPlaces.find(p => p._id.equals(fromPlace)),
      ...wayPoints.map(id => selectedPlaces.find(p => p._id.equals(id))),
      selectedPlaces.find(p => p._id.equals(toPlace))
    ].filter(Boolean);

    // Collect unique cities/states
    const cities = [...new Set(orderedPlaces.map(p => p?.address?.city).filter(Boolean))];
    const states = [...new Set(orderedPlaces.map(p => p?.address?.state).filter(Boolean))];

    // Fetch more nearby places to enrich the trip
    let extraPlaces = await Place.find({
      $or: [
        { "address.city": { $in: cities } },
        { "address.state": { $in: states } }
      ]
    });

    // Shuffle extra places for randomness
    extraPlaces = shuffle(extraPlaces);

    // Merge unique
    const allPlaces = [
      ...new Map([...orderedPlaces, ...extraPlaces].map(p => [p._id.toString(), p])).values()
    ];

    // Fetch hotels & events
    const planData = await Promise.all(
      allPlaces.map(async place => {
        // Pick a random hotel (not just first one)
        const hotels = await Hotel.find({
          location: {
            $nearSphere: {
              $geometry: place.location,
              $maxDistance: 15000
            }
          }
        }).limit(5);

        const hotel = hotels.length ? hotels[Math.floor(Math.random() * hotels.length)] : null;

        // Events filtering
        const eventQuery = {
          location: {
            $nearSphere: {
              $geometry: place.location,
              $maxDistance: 15000
            }
          }
        };
        if (startTimestamp && endTimestamp) {
          eventQuery["schedule.from"] = { $lte: new Date(endTimestamp) };
          eventQuery["schedule.to"] = { $gte: new Date(startTimestamp) };
        }

        let events = await Event.find(eventQuery).limit(10);
        events = shuffle(events).slice(0, 2); // 0–2 events

        return { place, hotel, events };
      })
    );

    // Shuffle planData to simulate "AI exploration"
    const mixedPlan = shuffle(planData);

    // Split into days more naturally
    const dailyPlan = [];
    let index = 0;
    for (let i = 0; i < daysOfTrip; i++) {
      const today = [];
      const stops = Math.floor(Math.random() * 3) + 1; // 1–3 places per day
      for (let j = 0; j < stops && index < mixedPlan.length; j++) {
        today.push(mixedPlan[index]);
        index++;
      }
      if (today.length > 0) {
        dailyPlan.push({
          day: i + 1,
          agenda: shuffle(today) // random morning/afternoon order
        });
      }
    }

    // Persist generated plan to user's history (best-effort)
    try {
      const historyEntry = {
        inputs: {
          fromPlace,
          toPlace,
          wayPoints,
          personCount,
          daysOfTrip,
          startTimestamp,
          endTimestamp,
        },
        result: {
          days: dailyPlan,
        },
      };

      // req.user expected to be set by requireAuth middleware
      if (req.user?.id) {
        await History.create({ user: req.user.id, plan: historyEntry });
      }
    } catch (saveErr) {
      console.error("Failed to save plan history:", saveErr);
      // Non-blocking: we still return the generated plan
    }

    res.status(200).json({ 
      success: true, 
      days: dailyPlan,
    });

  } catch (err) {
    console.error("TripPlan error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


export const getPlanHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      History.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      History.countDocuments({ user: userId })
    ]);

    res.status(200).json({ success: true, plans, meta: { page, limit, total } });
  } catch (err) {
    console.error("Get plan history error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
