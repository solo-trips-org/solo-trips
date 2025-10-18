import { Place } from "../models/place.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Event } from "../models/event.model.js";
import History from "../models/histrory.model.js";
import * as rabbitmq from "../../config/rabbitmq.js";
import * as websocket from "../../config/websocket.js";

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

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

        // Create daily plan
        const mixedPlan = shuffle(planData);
        const dailyPlan = [];
        let index = 0;
        
        for (let i = 0; i < daysOfTrip; i++) {
            const today = [];
            const stops = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < stops && index < mixedPlan.length; j++) {
                today.push(mixedPlan[index]);
                index++;
            }
            if (today.length > 0) {
                dailyPlan.push({
                    day: i + 1,
                    agenda: shuffle(today)
                });
            }
        }

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