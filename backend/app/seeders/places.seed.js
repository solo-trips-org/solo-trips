// seed/places.seed.js
import mongoose from "mongoose";
import { Place } from "../models/place.model.js";

export const seedPlaces = async () => {
  const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/yourdb";
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  const defaultPlaces = [
    {
      name: "Nallur Kandaswamy Kovil",
      description: "Famous Hindu temple dedicated to Lord Murugan.",
      category: "Temple",
      address: { street: "Nallur", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0220, 9.6756] }, // [lng, lat]
      openingHours: "06:00 - 20:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "Donations welcome" },
      visitDuration: { minMinutes: 30, maxMinutes: 90 },
    },
    {
      name: "Jaffna Fort",
      description: "Dutch / Portuguese-era fort overlooking the lagoon.",
      category: "Historic",
      address: { street: "Fort", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0103, 9.6622] },
      openingHours: "08:00 - 18:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "Small guided-tour fees may apply" },
      visitDuration: { minMinutes: 30, maxMinutes: 90 },
    },
    {
      name: "Jaffna Public Library",
      description: "Iconic library, rebuilt after 1981 fire; cultural landmark.",
      category: "Library",
      address: { street: "Hospital Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0078, 9.6685] },
      openingHours: "09:00 - 18:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 20, maxMinutes: 60 },
    },
    {
      name: "Casuarina Beach",
      description: "Popular beach near Karainagar with calm shallow waters.",
      category: "Beach",
      address: { street: "Karainagar", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [79.8769, 9.7408] },
      openingHours: "Open 24 hours",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 60, maxMinutes: 240 },
    },
    {
      name: "Nagadeepa Purana Vihara",
      description: "Ancient Buddhist temple on Nainativu Island.",
      category: "Temple",
      address: { street: "Nainativu", city: "Nainativu", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [79.7809, 9.6051] },
      openingHours: "06:00 - 18:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "Boat/ferry fare not included" },
      visitDuration: { minMinutes: 45, maxMinutes: 120 },
    },
    {
      name: "Nainativu Nagapooshani Amman Temple",
      description: "Shakti Peetha, important Hindu shrine on Nainativu Island.",
      category: "Temple",
      address: { street: "Nainativu", city: "Nainativu", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [79.7830, 9.6060] },
      openingHours: "06:00 - 19:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "Donations accepted" },
      visitDuration: { minMinutes: 30, maxMinutes: 90 },
    },
    {
      name: "Dambakola Patuna Sangamitta Temple (Landing Site)",
      description: "Historic landing site associated with Sangamitta Theri and the Bodhi sapling.",
      category: "Historic",
      address: { street: "Dambakola Patuna", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0277, 9.8286] },
      openingHours: "06:00 - 18:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 20, maxMinutes: 60 },
    },
    {
      name: "Keerimalai Springs",
      description: "Freshwater springs near the sea believed to have healing properties.",
      category: "Natural",
      address: { street: "Keerimalai", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0381, 9.8240] },
      openingHours: "06:00 - 18:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 30, maxMinutes: 120 },
    },
    {
      name: "Neduntheevu (Delft Island)",
      description: "Coral island known for wild ponies, coral walls and Dutch ruins.",
      category: "Island",
      address: { street: "Delft Island", city: "Neduntheevu", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [79.6420, 9.5086] },
      openingHours: "Open 24 hours",
      fees: { required: false, amount: 0, currency: "LKR", notes: "Boat/ferry fare applies separately" },
      visitDuration: { minMinutes: 180, maxMinutes: 480 },
    },
    {
      name: "Karainagar Lighthouse",
      description: "Lighthouse close to Casuarina Beach.",
      category: "Landmark",
      address: { street: "Karainagar", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [79.8780, 9.7450] },
      openingHours: "Open 24 hours",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 20, maxMinutes: 60 },
    },
    {
      name: "Charty Beach (Kayts)",
      description: "Quiet beach on Velanai / Kayts island.",
      category: "Beach",
      address: { street: "Kayts", city: "Velanai", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [79.9330, 9.6860] },
      openingHours: "Open 24 hours",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 60, maxMinutes: 240 },
    },
    {
      name: "Kantharodai (Kadurugoda) Stupa Complex",
      description: "Ancient Buddhist stupas and excavation site.",
      category: "Historic",
      address: { street: "Kantharodai", city: "Chunnakam", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0190, 9.7390] },
      openingHours: "08:00 - 18:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 30, maxMinutes: 90 },
    },
    {
      name: "Point Pedro (Uppuveli area)",
      description: "Northernmost tip of Sri Lanka with coastal views.",
      category: "Landmark",
      address: { street: "Point Pedro", city: "Point Pedro", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.2333, 9.8167] },
      openingHours: "Open 24 hours",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 30, maxMinutes: 180 },
    },
    {
      name: "Sangiliyan Statue",
      description: "Monument honoring King Cankili II (Sankili).",
      category: "Monument",
      address: { street: "Nallur", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0230, 9.6750] },
      openingHours: "Open 24 hours",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 10, maxMinutes: 30 },
    },
    {
      name: "Manalkadu (Sand Dunes)",
      description: "Sandy dunes and coastal landscape near Point Pedro.",
      category: "Natural",
      address: { street: "Point Pedro", city: "Point Pedro", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.2000, 9.8000] },
      openingHours: "Open 24 hours",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 30, maxMinutes: 120 },
    },
    {
      name: "Nagavihara Buddhist Temple (Jaffna town)",
      description: "Modern Buddhist temple in Jaffna town.",
      category: "Temple",
      address: { street: "Jaffna Town", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0050, 9.6680] },
      openingHours: "06:00 - 18:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 20, maxMinutes: 60 },
    },
    {
      name: "Kankesanthurai Beach (KKS)",
      description: "Large sandy beach north-west of Jaffna town.",
      category: "Beach",
      address: { street: "Kankesanthurai", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0700, 9.8170] },
      openingHours: "Open 24 hours",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 60, maxMinutes: 240 },
    },
    {
      name: "Chunnakam Market",
      description: "Bustling local market (vegetables, fish, spices).",
      category: "Market",
      address: { street: "Chunnakam", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0270, 9.7470] },
      openingHours: "06:00 - 20:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 20, maxMinutes: 90 },
    },
    {
      name: "Rio Ice Cream (local favorite)",
      description: "Popular local ice-cream shop.",
      category: "Food",
      address: { street: "Hospital Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0090, 9.6640] },
      openingHours: "10:00 - 23:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "Food purchase required for service" },
      visitDuration: { minMinutes: 10, maxMinutes: 30 },
    },
    {
      name: "Dutch Reformed Church (Jaffna)",
      description: "Colonial-era church (Dutch influence).",
      category: "Historic",
      address: { street: "Fort area", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0120, 9.6715] },
      openingHours: "08:00 - 18:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 15, maxMinutes: 45 },
    },
    {
      name: "St. Mary's Cathedral, Jaffna",
      description: "Prominent Catholic cathedral in Jaffna.",
      category: "Religious",
      address: { street: "Church St", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [80.0185, 9.6690] },
      openingHours: "06:00 - 20:00",
      fees: { required: false, amount: 0, currency: "LKR", notes: "" },
      visitDuration: { minMinutes: 15, maxMinutes: 45 },
    },
    {
      name: "Kayts Jetty",
      description: "Main ferry/boat departure for Kayts and nearby islets.",
      category: "Transport",
      address: { street: "Kayts", city: "Velanai", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      location: { type: "Point", coordinates: [79.9340, 9.6880] },
      openingHours: "Varies by ferry schedule",
      fees: { required: true, amount: 0, currency: "LKR", notes: "Boat/ferry fares vary and are paid on-site" },
      visitDuration: { minMinutes: 10, maxMinutes: 120 },
    }
  ];

  for (const place of defaultPlaces) {
    const exists = await Place.findOne({ name: place.name });
    if (!exists) {
      await Place.create(place);
      console.log(`✅ Seeded Place: ${place.name}`);
    } else {
      console.log(`⚠️ Place already exists: ${place.name}`);
    }
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
};
