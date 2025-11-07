import { Place } from "../models/place.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Event } from "../models/event.model.js";
import History from "../models/histrory.model.js";
import * as rabbitmq from "../../config/rabbitmq.js";

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

// Calculate distance between two points using Haversine formula
const calculateDistance = (loc1, loc2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  
  const dLat = toRad(loc2.coordinates[1] - loc1.coordinates[1]);
  const dLon = toRad(loc2.coordinates[0] - loc1.coordinates[0]);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.coordinates[1])) * Math.cos(toRad(loc2.coordinates[1])) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Prioritize places based on ratings and relevance
const prioritizePlaces = (places) => {
  return places.sort((a, b) => {
    const aScore = (a.averageRating || 0) * 0.7 + (a.popularity || 0) * 0.3;
    const bScore = (b.averageRating || 0) * 0.7 + (b.popularity || 0) * 0.3;
    return bScore - aScore;
  });
};

// Group places by proximity
const groupNearbyPlaces = (places, maxDistance = 20) => {
  const groups = [];
  const visited = new Set();
  
  places.forEach((place, index) => {
    if (visited.has(index)) return;
    
    const group = [place];
    visited.add(index);
    
    places.forEach((otherPlace, otherIndex) => {
      if (visited.has(otherIndex)) return;
      
      const distance = calculateDistance(place.location, otherPlace.location);
      if (distance <= maxDistance) {
        group.push(otherPlace);
        visited.add(otherIndex);
      }
    });
    
    groups.push(group);
  });
  
  return groups;
};

// Create a balanced daily itinerary
const createDailyItinerary = (planData, daysOfTrip) => {
  // Sort places by priority
  const prioritizedData = prioritizePlaces([...planData]);
  
  // Group nearby places
  const placeGroups = groupNearbyPlaces(prioritizedData.map(item => item.place));
  
  // Create daily plan
  const dailyPlan = [];
  const usedPlaces = new Set();
  
  for (let day = 1; day <= daysOfTrip; day++) {
    const dayAgenda = {
      morning: null,
      afternoon: null,
      evening: null
    };
    
    // Select places for this day
    const placesForDay = [];
    let timeSlot = 'morning';
    
    // Try to fill all time slots
    while (placesForDay.length < 3 && planData.length > usedPlaces.size) {
      // Find next unused place
      const nextPlaceIndex = planData.findIndex((item, index) => 
        !usedPlaces.has(index) && 
        !placesForDay.includes(item)
      );
      
      if (nextPlaceIndex === -1) break;
      
      const placeItem = planData[nextPlaceIndex];
      placesForDay.push(placeItem);
      usedPlaces.add(nextPlaceIndex);
      
      // Assign to time slot
      dayAgenda[timeSlot] = {
        place: {
          id: placeItem.place._id,
          name: placeItem.place.name,
          description: placeItem.place.description,
          image: placeItem.place.image,
          address: placeItem.place.address,
          averageRating: placeItem.place.averageRating,
          category: placeItem.place.category
        },
        hotel: placeItem.hotel ? {
          id: placeItem.hotel._id,
          name: placeItem.hotel.name,
          description: placeItem.hotel.description,
          image: placeItem.hotel.image,
          address: placeItem.hotel.address,
          averageRating: placeItem.hotel.averageRating,
          priceRange: placeItem.hotel.priceRange
        } : null,
        events: placeItem.events.map(event => ({
          id: event._id,
          title: event.title,
          description: event.description,
          image: event.image,
          address: event.address,
          schedule: event.schedule,
          averageRating: event.averageRating
        }))
      };
      
      // Move to next time slot
      if (timeSlot === 'morning') timeSlot = 'afternoon';
      else if (timeSlot === 'afternoon') timeSlot = 'evening';
      else break;
    }
    
    dailyPlan.push({
      day,
      date: null, // Will be set by frontend based on start date
      agenda: dayAgenda
    });
  }
  
  return dailyPlan;
};

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

    // Create organized daily itinerary
    const dailyPlan = createDailyItinerary(planData, daysOfTrip);

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


export const generateTripPlanAsync = async (req, res) => {
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

    // Validate required fields
    if (!fromPlace || !toPlace) {
      return res.status(400).json({ 
        success: false, 
        message: "fromPlace and toPlace are required" 
      });
    }

    // Create a unique request ID
    const requestId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare message payload with organized structure
    const messagePayload = {
      requestId,
      userId: req.user?.id,
      tripDetails: {
        fromPlace,
        toPlace,
        wayPoints,
        personCount,
        daysOfTrip,
        startTimestamp,
        endTimestamp
      },
      timestamp: new Date().toISOString()
    };

    // Queue the trip planning request
    await rabbitmq.publishMessage('trip.planning.request', messagePayload);

    // Create initial history entry with pending status
    if (req.user?.id) {
      await History.create({
        user: req.user.id,
        requestId,
        status: 'pending',
        plan: {
          inputs: messagePayload.tripDetails,
          result: null
        }
      });
    }

    res.status(202).json({
      success: true,
      message: "Trip planning request has been queued",
      requestId,
      status: 'pending'
    });

  } catch (err) {
    console.error("Async TripPlan error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to queue trip planning request" 
    });
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
