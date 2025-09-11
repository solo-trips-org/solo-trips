import { Hotel } from "../models/hotel.model.js";

export const seedHotels = async () => {
  await Hotel.deleteMany();

  const hotels = [
    {
      name: "Jetwing Jaffna",
      category: "Luxury",
      type: "Hotel",
      address: { street: "Mahathma Gandhi Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/jetwing/600/400",
      location: { type: "Point", coordinates: [80.0087, 9.6625] },
      description: "A modern luxury hotel in the heart of Jaffna town with rooftop views."
    },
    {
      name: "Tilko Jaffna City Hotel",
      category: "Mid-range",
      type: "Hotel",
      address: { street: "Main St", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/tilko/600/400",
      location: { type: "Point", coordinates: [80.0091, 9.6640] },
      description: "Popular city hotel with easy access to Jaffna Fort and town center."
    },
    {
      name: "Green Grass Hotel",
      category: "Budget",
      type: "Hotel",
      address: { street: "A9 Road", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/greengrass/600/400",
      location: { type: "Point", coordinates: [80.0105, 9.6608] },
      description: "Affordable hotel with restaurant and event facilities."
    },
    {
      name: "North Gate by Jetwing",
      category: "Luxury",
      type: "Hotel",
      address: { street: "Hospital Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/northgate/600/400",
      location: { type: "Point", coordinates: [80.0110, 9.6665] },
      description: "Upscale business hotel opposite Jaffna Railway Station."
    },
    {
      name: "Fox Resorts Jaffna",
      category: "Boutique",
      type: "Hotel",
      address: { street: "Kokuvil East", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/foxresort/600/400",
      location: { type: "Point", coordinates: [80.0221, 9.6900] },
      description: "Boutique resort blending heritage and luxury, located in Kokuvil."
    },
    {
      name: "Cosy Restaurant",
      category: "Family Dining",
      type: "Restaurent",
      address: { street: "Kankesanturai Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/cosy/600/400",
      location: { type: "Point", coordinates: [80.0214, 9.6795] },
      description: "Popular family restaurant known for Jaffna-style seafood dishes."
    },
    {
      name: "Malayan Cafe",
      category: "Vegetarian",
      type: "Restaurent",
      address: { street: "Hospital Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/malayan/600/400",
      location: { type: "Point", coordinates: [80.0102, 9.6649] },
      description: "Iconic vegetarian restaurant serving traditional Tamil meals."
    },
    {
      name: "Rolex Hotel & Restaurant",
      category: "Casual Dining",
      type: "Restaurent",
      address: { street: "Clock Tower Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/rolex/600/400",
      location: { type: "Point", coordinates: [80.0088, 9.6655] },
      description: "Casual dining spot offering South Indian and Sri Lankan meals."
    },
    {
      name: "Subash Hotel",
      category: "Budget",
      type: "Hotel",
      address: { street: "Main St", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/subash/600/400",
      location: { type: "Point", coordinates: [80.0095, 9.6635] },
      description: "Budget-friendly accommodation option in Jaffna town."
    },
    {
      name: "Gnanams Hotel",
      category: "Mid-range",
      type: "Hotel",
      address: { street: "Clock Tower Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/gnanams/600/400",
      location: { type: "Point", coordinates: [80.0086, 9.6652] },
      description: "Popular hotel with spacious rooms and vegetarian dining."
    },

    // --- Restaurants / Cafes ---
    {
      name: "Rio Ice Cream",
      category: "Dessert",
      type: "Restaurent",
      address: { street: "Hospital Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/rio/600/400",
      location: { type: "Point", coordinates: [80.0115, 9.6640] },
      description: "Famous ice cream parlour in Jaffna loved by locals and visitors."
    },
    {
      name: "Mangos Vegetarian Restaurant",
      category: "Vegetarian",
      type: "Restaurent",
      address: { street: "Kankesanturai Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/mangos/600/400",
      location: { type: "Point", coordinates: [80.0312, 9.6760] },
      description: "Well-known vegetarian restaurant serving dosas and South Indian meals."
    },
    {
      name: "Yarl Eat House",
      category: "Casual Dining",
      type: "Restaurent",
      address: { street: "KKS Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/yarleat/600/400",
      location: { type: "Point", coordinates: [80.0278, 9.6780] },
      description: "Affordable eatery famous for spicy Jaffna crab curry."
    },
    {
      name: "Hotel Rolex South",
      category: "Casual Dining",
      type: "Restaurent",
      address: { street: "A9 Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/rolexsouth/600/400",
      location: { type: "Point", coordinates: [80.0150, 9.6590] },
      description: "Branch of the famous Rolex Hotel offering authentic Jaffna cuisine."
    },
    {
      name: "Cool Land Restaurant",
      category: "Family Dining",
      type: "Restaurent",
      address: { street: "Stanley Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/coolland/600/400",
      location: { type: "Point", coordinates: [80.0120, 9.6620] },
      description: "Family restaurant offering wide range of Sri Lankan dishes."
    },
    {
      name: "Malayan South Indian Restaurant",
      category: "Vegetarian",
      type: "Restaurent",
      address: { street: "KKS Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/malayansouth/600/400",
      location: { type: "Point", coordinates: [80.0295, 9.6770] },
      description: "Authentic South Indian vegetarian meals with banana leaf service."
    },
    {
      name: "Ariyas Restaurant",
      category: "Vegetarian",
      type: "Restaurent",
      address: { street: "Stanley Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/ariyas/600/400",
      location: { type: "Point", coordinates: [80.0135, 9.6635] },
      description: "Local vegetarian favorite, known for tiffin and thali meals."
    },
    {
      name: "New Mooring Cafe",
      category: "Cafe",
      type: "Restaurent",
      address: { street: "Beach Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/mooring/600/400",
      location: { type: "Point", coordinates: [80.0060, 9.6680] },
      description: "Cozy cafe near Jaffna lagoon offering snacks and drinks."
    },
    {
      name: "Biriyani Hut",
      category: "Casual Dining",
      type: "Restaurent",
      address: { street: "Hospital Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/biriyani/600/400",
      location: { type: "Point", coordinates: [80.0108, 9.6655] },
      description: "Affordable restaurant popular for chicken and mutton biriyani."
    },
    {
      name: "Queens Hotel Jaffna",
      category: "Mid-range",
      type: "Hotel",
      address: { street: "Stanley Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/queens/600/400",
      location: { type: "Point", coordinates: [80.0130, 9.6610] },
      description: "Mid-range hotel in the city with comfortable amenities."
    },
    {
      name: "Senthil Complex",
      category: "Casual Dining",
      type: "Restaurent",
      address: { street: "KKS Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/senthil/600/400",
      location: { type: "Point", coordinates: [80.0305, 9.6765] },
      description: "Busy restaurant complex offering Jaffna-style vegetarian meals."
    },
    {
      name: "Harbourside Restaurant",
      category: "Seafood",
      type: "Restaurent",
      address: { street: "Beach Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/harbour/600/400",
      location: { type: "Point", coordinates: [80.0075, 9.6675] },
      description: "Seafood restaurant near the lagoon with fresh crab and prawn dishes."
    },
    {
      name: "Ganesh Hotel",
      category: "Vegetarian",
      type: "Restaurent",
      address: { street: "Main St", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/ganesh/600/400",
      location: { type: "Point", coordinates: [80.0098, 9.6638] },
      description: "Simple and traditional restaurant serving vegetarian meals."
    },
    {
      name: "Hotel Blue Whale",
      category: "Mid-range",
      type: "Hotel",
      address: { street: "Beach Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/bluewhale/600/400",
      location: { type: "Point", coordinates: [80.0050, 9.6690] },
      description: "Seaside hotel offering seafood restaurant and ocean views."
    },
    {
      name: "Hotel Greenland",
      category: "Budget",
      type: "Hotel",
      address: { street: "A9 Rd", city: "Jaffna", state: "Northern Province", zipCode: "40000", country: "Sri Lanka" },
      image: "https://picsum.photos/seed/greenland/600/400",
      location: { type: "Point", coordinates: [80.0145, 9.6605] },
      description: "Affordable hotel near Jaffna bus stand with basic facilities."
    }
  ];

  await Hotel.insertMany(hotels);
  console.log("✅ Seeded 25+ Hotels & Restaurants in Jaffna!");
};
