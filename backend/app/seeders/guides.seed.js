import { Guide } from "../models/guide.model.js";

export const seedGuides = async () => {
  await Guide.deleteMany();

  const guides = [
    {
      name: "S. Ananthan",
      phone: "0771000001",
      gender: "male",
      address: { street: "Nallur Temple Road", city: "Nallur", state: "Jaffna", zipCode: "40000", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "ananthan@gmail.com"
    },
    {
      name: "R. Kanagasabai",
      phone: "0771000002",
      gender: "male",
      address: { street: "Point Pedro Street", city: "Point Pedro", state: "Jaffna", zipCode: "40010", country: "Sri Lanka" },
      languages: ["Tamil", "Sinhala"],
      contactInfo: "kanagasabai@gmail.com"
    },
    {
      name: "M. Shanthini",
      phone: "0771000003",
      gender: "female",
      address: { street: "Casuarina Beach Road", city: "Karainagar", state: "Jaffna", zipCode: "40020", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "shanthini@gmail.com"
    },
    {
      name: "K. Arulpragasam",
      phone: "0771000004",
      gender: "male",
      address: { street: "Jaffna Fort Road", city: "Jaffna", state: "Jaffna", zipCode: "40000", country: "Sri Lanka" },
      languages: ["Tamil"],
      contactInfo: "arulpragasam@gmail.com"
    },
    {
      name: "S. Thavachelvan",
      phone: "0771000005",
      gender: "male",
      address: { street: "Chavakachcheri Street", city: "Chavakachcheri", state: "Jaffna", zipCode: "40030", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "thavachelvan@gmail.com"
    },
    {
      name: "V. Anjali",
      phone: "0771000006",
      gender: "female",
      address: { street: "Nainativu Road", city: "Nainativu", state: "Jaffna", zipCode: "40040", country: "Sri Lanka" },
      languages: ["Tamil"],
      contactInfo: "anjali@gmail.com"
    },
    {
      name: "T. Praveen",
      phone: "0771000007",
      gender: "male",
      address: { street: "Kayts Road", city: "Kayts", state: "Jaffna", zipCode: "40050", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "praveen@gmail.com"
    },
    {
      name: "S. Nishanthini",
      phone: "0771000008",
      gender: "female",
      address: { street: "Tellippalai Street", city: "Tellippalai", state: "Jaffna", zipCode: "40060", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "nishanthini@gmail.com"
    },
    {
      name: "R. Gnaneswaran",
      phone: "0771000009",
      gender: "male",
      address: { street: "Valvettithurai Road", city: "Valvettithurai", state: "Jaffna", zipCode: "40070", country: "Sri Lanka" },
      languages: ["Tamil"],
      contactInfo: "gnaneswaran@gmail.com"
    },
    {
      name: "M. Kavitha",
      phone: "0771000010",
      gender: "female",
      address: { street: "Uduvil Road", city: "Uduvil", state: "Jaffna", zipCode: "40080", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "kavitha@gmail.com"
    },
    {
      name: "S. Ramesh",
      phone: "0771000011",
      gender: "male",
      address: { street: "Nallur Main Street", city: "Nallur", state: "Jaffna", zipCode: "40000", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "ramesh@gmail.com"
    },
    {
      name: "K. Priyanka",
      phone: "0771000012",
      gender: "female",
      address: { street: "Point Pedro Beach Road", city: "Point Pedro", state: "Jaffna", zipCode: "40010", country: "Sri Lanka" },
      languages: ["Tamil"],
      contactInfo: "priyanka@gmail.com"
    },
    {
      name: "R. Suresh",
      phone: "0771000013",
      gender: "male",
      address: { street: "Karainagar Main Road", city: "Karainagar", state: "Jaffna", zipCode: "40020", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "suresh@gmail.com"
    },
    {
      name: "V. Anitha",
      phone: "0771000014",
      gender: "female",
      address: { street: "Chavakachcheri Road", city: "Chavakachcheri", state: "Jaffna", zipCode: "40030", country: "Sri Lanka" },
      languages: ["Tamil"],
      contactInfo: "anitha@gmail.com"
    },
    {
      name: "M. Harish",
      phone: "0771000015",
      gender: "male",
      address: { street: "Nainativu Temple Road", city: "Nainativu", state: "Jaffna", zipCode: "40040", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "harish@gmail.com"
    },
    {
      name: "S. Dinesh",
      phone: "0771000016",
      gender: "male",
      address: { street: "Kayts Main Road", city: "Kayts", state: "Jaffna", zipCode: "40050", country: "Sri Lanka" },
      languages: ["Tamil"],
      contactInfo: "dinesh@gmail.com"
    },
    {
      name: "K. Sandhya",
      phone: "0771000017",
      gender: "female",
      address: { street: "Tellippalai Main Street", city: "Tellippalai", state: "Jaffna", zipCode: "40060", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "sandhya@gmail.com"
    },
    {
      name: "R. Thiyagarajah",
      phone: "0771000018",
      gender: "male",
      address: { street: "Valvettithurai Coastal Road", city: "Valvettithurai", state: "Jaffna", zipCode: "40070", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "thiyagarajah@gmail.com"
    },
    {
      name: "M. Lakshmi",
      phone: "0771000019",
      gender: "female",
      address: { street: "Uduvil Street", city: "Uduvil", state: "Jaffna", zipCode: "40080", country: "Sri Lanka" },
      languages: ["Tamil"],
      contactInfo: "lakshmi@gmail.com"
    },
    {
      name: "S. Prakash",
      phone: "0771000020",
      gender: "male",
      address: { street: "Jaffna Fort Road", city: "Jaffna", state: "Jaffna", zipCode: "40000", country: "Sri Lanka" },
      languages: ["Tamil", "English"],
      contactInfo: "prakash@gmail.com"
    },
  ];

  await Guide.insertMany(guides);
  console.log("✅ Seeded 20 guides in Jaffna successfully!");
};
