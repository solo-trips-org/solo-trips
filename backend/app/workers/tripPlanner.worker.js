import { Place } from "../models/place.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Event } from "../models/event.model.js";
import History from "../models/histrory.model.js";
import * as rabbitmq from "../../config/rabbitmq.js";
import * as websocket from "../../config/websocket.js";

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

async function processTripPlan(message) {
    const { requestId, userId, tripDetails } = message;
    
    try {
        const { 
            fromPlace, 
            toPlace, 
            wayPoints = [], 
            personCount = 1, 
            daysOfTrip = 1, 
            startTimestamp, 
            endTimestamp 
        } = tripDetails;

        // Fetch selected places
        const selectedPlaces = await Place.find({
            _id: { $in: [fromPlace, toPlace, ...wayPoints] }
        });

        if (selectedPlaces.length === 0) {
            throw new Error("Places not found");
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

        // Fetch more nearby places
        let extraPlaces = await Place.find({
            $or: [
                { "address.city": { $in: cities } },
                { "address.state": { $in: states } }
            ]
        });

        extraPlaces = shuffle(extraPlaces);

        // Merge unique places
        const allPlaces = [
            ...new Map([...orderedPlaces, ...extraPlaces].map(p => [p._id.toString(), p])).values()
        ];

        // Fetch hotels & events
        const planData = await Promise.all(
            allPlaces.map(async place => {
                const hotels = await Hotel.find({
                    location: {
                        $nearSphere: {
                            $geometry: place.location,
                            $maxDistance: 15000
                        }
                    }
                }).limit(5);

                const hotel = hotels.length ? hotels[Math.floor(Math.random() * hotels.length)] : null;

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
                events = shuffle(events).slice(0, 2);

                return { place, hotel, events };
            })
        );

        // Create organized daily itinerary
        const dailyPlan = createDailyItinerary(planData, daysOfTrip);

        // Update history with completed plan
        if (userId) {
            await History.findOneAndUpdate(
                { requestId },
                { 
                    status: 'completed',
                    plan: {
                        inputs: tripDetails,
                        result: {
                            days: dailyPlan
                        }
                    }
                }
            );
        }

        // Publish completion message
        await rabbitmq.publishMessage('trip.planning.completed', {
            requestId,
            userId,
            status: 'completed',
            result: dailyPlan
        });

        // Send WebSocket notification
        if (userId) {
            websocket.notifyUser(userId, {
                type: 'TRIP_PLAN_COMPLETED',
                requestId,
                message: 'Your trip plan is ready!',
                timestamp: new Date().toISOString(),
                data: {
                    requestId,
                    status: 'completed'
                }
            });
        }

    } catch (error) {
        console.error(`Error processing trip plan ${requestId}:`, error);
        
        // Update history with error status
        if (userId) {
            await History.findOneAndUpdate(
                { requestId },
                { 
                    status: 'failed',
                    error: error.message
                }
            );
        }

        // Publish error message
        await rabbitmq.publishMessage('trip.planning.failed', {
            requestId,
            userId,
            status: 'failed',
            error: error.message
        });
    }
}

// Start the worker
async function startWorker() {
    try {
        await rabbitmq.connectQueue();
        console.log('Trip planner worker started');
        
        await rabbitmq.consumeMessages('trip.planning.request', processTripPlan);
        
    } catch (error) {
        console.error('Failed to start trip planner worker:', error);
        process.exit(1);
    }
}

startWorker();