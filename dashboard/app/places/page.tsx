"use client"; // Indicates this is a Client Component in Next.js, enabling client-side rendering

import { useState, useEffect } from "react"; // Import React hooks for state management and side effects
import { Pencil, Eye, Trash2, Plus, X } from "lucide-react"; // Import icons from Lucide for UI buttons

// Types based on the provided schema for type safety
type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type Fees = {
  required: boolean;
  amount: number;
  currency: string;
  notes: string;
};

type VisitDuration = {
  minMinutes: number;
  maxMinutes: number;
};

type Location = {
  type: "Point"; // GeoJSON Point type
  coordinates: [number, number]; // [longitude, latitude]
};

type Place = {
  _id: string; // Unique identifier for the place
  name: string;
  description: string;
  category: string;
  image: string; // URL of the place's image
  address: Address;
  openingHours: string;
  fees: Fees;
  visitDuration: VisitDuration;
  location: Location;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number; // Version key for MongoDB
};

// Mock media type for demonstration (actual media API response structure)
type Media = {
  id: string;
  url: string;
  name: string;
};

// API base URLs for places and media
const API_BASE = "https://trips-api.tselven.com/api/places";
const MEDIA_API = "https://trips-api.tselven.com/api/media";

export default function PlacesPage() {
  // State for managing places data and UI states
  const [places, setPlaces] = useState<Place[]>([]); // List of places fetched from API
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState<string | null>(null); // Error state for API failures
  const [page, setPage] = useState(1); // Current page for pagination
  const [limit] = useState(10); // Number of places per page (fixed at 10)
  const [total, setTotal] = useState(0); // Total number of places
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  // Modal-related states
  const [modalOpen, setModalOpen] = useState(false); // Controls visibility of place modal
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add"); // Mode of the modal (add, edit, view)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null); // Currently selected place for edit/view
  const [formData, setFormData] = useState<Partial<Place>>({}); // Form data for add/edit
  const [mediaModalOpen, setMediaModalOpen] = useState(false); // Controls visibility of media selection modal
  const [mediaItems, setMediaItems] = useState<Media[]>([]); // List of media items for image selection

  // Fetches places from the API with pagination
  const fetchPlaces = async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true); // Set loading state to true
      setError(null); // Clear any previous errors
      const token = localStorage.getItem("token"); // Get auth token from localStorage
      const response = await fetch(`${API_BASE}?limit=${limitNum}&page=${pageNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}, // Include token if available
      });
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`); // Check for HTTP errors
      const { data, meta } = await response.json(); // Parse response JSON
      setPlaces(Array.isArray(data) ? data : []); // Set places, ensuring it's an array
      setTotal(meta?.total || 0); // Update total places count
      setTotalPages(meta?.totalPages || 1); // Update total pages
    } catch (err) {
      // Handle errors and set error message
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Fetches media items for image selection
  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem("token"); // Get auth token
      const response = await fetch(MEDIA_API, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}, // Include token if available
      });
      if (!response.ok) throw new Error("Failed to fetch media"); // Check for HTTP errors
      const data = await response.json(); // Parse response JSON
      setMediaItems(Array.isArray(data) ? data : []); // Set media items, ensuring it's an array
    } catch (err) {
      // Show error alert
      alert(err instanceof Error ? err.message : "Failed to fetch media");
    }
  };

  // Fetch places when the page changes
  useEffect(() => {
    fetchPlaces(); // Call fetchPlaces on mount and when page changes
  }, [page]);

  // Creates a new place via API
  const createPlace = async (newPlace: Omit<Place, "_id" | "createdAt" | "updatedAt" | "__v">) => {
    try {
      const token = localStorage.getItem("token"); // Get auth token
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // Include token if available
        },
        body: JSON.stringify(newPlace), // Send place data as JSON
      });
      if (!response.ok) throw new Error("Failed to create"); // Check for HTTP errors
      const created = await response.json(); // Parse response
      fetchPlaces(); // Refresh places list
      return created;
    } catch (err) {
      // Show error alert
      alert(err instanceof Error ? err.message : "Failed to create");
    }
  };

  // Updates an existing place via API
  const updatePlace = async (id: string, updates: Partial<Place>) => {
    try {
      const token = localStorage.getItem("token"); // Get auth token
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // Include token if available
        },
        body: JSON.stringify(updates), // Send updated data as JSON
      });
      if (!response.ok) throw new Error("Failed to update"); // Check for HTTP errors
      const updated = await response.json(); // Parse response
      fetchPlaces(); // Refresh places list
      return updated;
    } catch (err) {
      // Show error alert
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  // Deletes a place via API
  const deletePlace = async (id: string) => {
    if (!confirm("Are you sure you want to delete this place?")) return; // Confirm deletion
    try {
      const token = localStorage.getItem("token"); // Get auth token
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}, // Include token if available
      });
      if (!response.ok) throw new Error("Failed to delete"); // Check for HTTP errors
      fetchPlaces(); // Refresh places list
    } catch (err) {
      // Show error alert
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  // Fetches a single place by ID
  const getPlace = async (id: string) => {
    try {
      const token = localStorage.getItem("token"); // Get auth token
      const response = await fetch(`${API_BASE}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}, // Include token if available
      });
      if (!response.ok) throw new Error("Failed to fetch"); // Check for HTTP errors
      return (await response.json()) as Place; // Return place data
    } catch (err) {
      // Show error alert and return null
      alert(err instanceof Error ? err.message : "Failed to fetch");
      return null;
    }
  };

  // Opens the place modal in add, edit, or view mode
  const openModal = async (mode: "add" | "edit" | "view", place?: Place) => {
    setModalMode(mode); // Set modal mode
    if (mode === "add") {
      // Initialize form data for adding a new place
      setFormData({
        name: "",
        description: "",
        category: "",
        image: "",
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        openingHours: "",
        fees: { required: false, amount: 0, currency: "LKR", notes: "" },
        visitDuration: { minMinutes: 0, maxMinutes: 0 },
        location: { type: "Point", coordinates: [0, 0] },
      });
    } else if (place) {
      // Fetch full place data for edit/view and set form data
      const fullPlace = await getPlace(place._id);
      setSelectedPlace(fullPlace || place);
      setFormData(fullPlace || place || {});
    }
    setModalOpen(true); // Show the modal
  };

  // Closes the place modal and resets related states
  const closeModal = () => {
    setModalOpen(false);
    setSelectedPlace(null);
    setFormData({});
  };

  // Opens the media selection modal and fetches media items
  const openMediaModal = async () => {
    await fetchMedia(); // Fetch media items
    setMediaModalOpen(true); // Show media modal
  };

  // Closes the media modal
  const closeMediaModal = () => {
    setMediaModalOpen(false);
  };

  // Updates form data with selected media URL
  const selectMedia = (url: string) => {
    setFormData({ ...formData, image: url }); // Set selected image URL
    setMediaModalOpen(false); // Close media modal
  };

  // Handles form submission for creating or updating a place
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (modalMode === "add") {
      // Create a new place
      await createPlace(formData as Omit<Place, "_id" | "createdAt" | "updatedAt" | "__v">);
    } else if (modalMode === "edit" && selectedPlace?._id) {
      // Update existing place
      await updatePlace(selectedPlace._id, formData);
    }
    closeModal(); // Close modal after submission
  };

  // Handles input changes for form fields, including nested fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any; // Get input details
    const keys = name.split("."); // Split nested field names (e.g., address.street)
    let updatedForm = { ...formData }; // Copy current form data

    let current: any = updatedForm;
    // Traverse nested object to update the correct field
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {}; // Initialize nested object if missing
      current = current[keys[i]];
    }
    // Update the field value based on input type
    current[keys[keys.length - 1]] = type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value;

    setFormData(updatedForm); // Update form data state
  };

  // Handles changes to location coordinates (longitude/latitude)
  const handleCoordChange = (index: 0 | 1, value: string) => {
    const coords = [...(formData.location?.coordinates || [0, 0])]; // Copy current coordinates
    coords[index] = parseFloat(value) || 0; // Update longitude (0) or latitude (1)
    setFormData({
      ...formData,
      location: { type: "Point", coordinates: coords as [number, number] }, // Update location
    });
  };

  // Render loading state
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
        Loading...
      </div>
    );

  // Render error state
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
        Error: {error}
      </div>
    );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Places Dashboard</h1>
          <button
            onClick={() => openModal("add")} // Open modal in add mode
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-5 h-5" /> Add New Place
          </button>
        </div>

        {/* Pagination controls (top) */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
          <span>Total Places: {total}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))} // Go to previous page
              disabled={page === 1} // Disable if on first page
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)} // Go to next page
              disabled={page >= totalPages} // Disable if on last page
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>

        {/* Places table */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900 text-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Coordinates</th>
                  <th className="px-6 py-4 font-semibold">Opening Hours</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {places.map((place) => (
                  <tr
                    key={place._id} // Unique key for each row
                    className="hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-gray-300">{place._id.slice(-6)}</td>
                    <td className="px-6 py-4 font-medium text-white">{place.name}</td>
                    <td className="px-6 py-4 text-gray-300">{place.category}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {place.address.city}, {place.address.state}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      [{place.location.coordinates[0].toFixed(4)},{" "}
                      {place.location.coordinates[1].toFixed(4)}]
                    </td>
                    <td className="px-6 py-4 text-gray-300">{place.openingHours}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => openModal("edit", place)} // Open edit modal
                        className="p-2 bg-yellow-600/80 hover:bg-yellow-600 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal("view", place)} // Open view modal
                        className="p-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePlace(place._id)} // Delete place
                        className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Place Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {modalMode === "add"
                    ? "Add Place"
                    : modalMode === "edit"
                    ? "Edit Place"
                    : "View Place"}
                </h2>
                <button
                  onClick={closeModal} // Close modal
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* View mode display */}
              {modalMode === "view" && selectedPlace ? (
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong>Name:</strong> {selectedPlace.name}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedPlace.description}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedPlace.category}
                  </p>
                  <img
                    src={selectedPlace.image}
                    alt={selectedPlace.name}
                    className="w-full h-48 object-cover rounded"
                  />
                  <p>
                    <strong>Address:</strong> {selectedPlace.address.street},{" "}
                    {selectedPlace.address.city}, {selectedPlace.address.state},{" "}
                    {selectedPlace.address.zipCode}, {selectedPlace.address.country}
                  </p>
                  <p>
                    <strong>Opening Hours:</strong> {selectedPlace.openingHours}
                  </p>
                  <p>
                    <strong>Fees:</strong> Required:{" "}
                    {selectedPlace.fees.required ? "Yes" : "No"}, Amount:{" "}
                    {selectedPlace.fees.amount} {selectedPlace.fees.currency},
                    Notes: {selectedPlace.fees.notes}
                  </p>
                  <p>
                    <strong>Visit Duration:</strong>{" "}
                    {selectedPlace.visitDuration.minMinutes} -{" "}
                    {selectedPlace.visitDuration.maxMinutes} minutes
                  </p>
                  <p>
                    <strong>Coordinates:</strong> [
                    {selectedPlace.location.coordinates[0]},{" "}
                    {selectedPlace.location.coordinates[1]}]
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(selectedPlace.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Updated:</strong>{" "}
                    {new Date(selectedPlace.updatedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                /* Form for add/edit modes */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <input
                      name="category"
                      value={formData.category || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      name="image"
                      value={formData.image || ""}
                      onChange={handleChange}
                      onClick={openMediaModal} // Open media modal on click
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                      placeholder="Click to select an image"
                    />
                  </div>
                  {/* Address fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Street</label>
                      <input
                        name="address.street"
                        value={formData.address?.street || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        name="address.city"
                        value={formData.address?.city || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input
                        name="address.state"
                        value={formData.address?.state || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Zip Code</label>
                      <input
                        name="address.zipCode"
                        value={formData.address?.zipCode || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Country</label>
                      <input
                        name="address.country"
                        value={formData.address?.country || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Opening Hours</label>
                    <input
                      name="openingHours"
                      value={formData.openingHours || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  {/* Fees fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="fees.required"
                          checked={formData.fees?.required || false}
                          onChange={handleChange}
                          className="mr-2 rounded"
                        />
                        Fees Required
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount</label>
                      <input
                        type="number"
                        name="fees.amount"
                        value={formData.fees?.amount || 0}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Currency</label>
                      <input
                        name="fees.currency"
                        value={formData.fees?.currency || "LKR"}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Fees Notes</label>
                      <input
                        name="fees.notes"
                        value={formData.fees?.notes || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {/* Visit duration fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Min Visit (minutes)
                      </label>
                      <input
                        type="number"
                        name="visitDuration.minMinutes"
                        value={formData.visitDuration?.minMinutes || 0}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Max Visit (minutes)
                      </label>
                      <input
                        type="number"
                        name="visitDuration.maxMinutes"
                        value={formData.visitDuration?.maxMinutes || 0}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                  {/* Coordinates fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.location?.coordinates?.[0] || 0}
                        onChange={(e) => handleCoordChange(0, e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.location?.coordinates?.[1] || 0}
                        onChange={(e) => handleCoordChange(1, e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {/* Form buttons */}
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={closeModal} // Cancel form
                      className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                      {modalMode === "add" ? "Create Place" : "Update Place"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Media Selection Modal */}
        {mediaModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              {/* Media modal header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Select Media</h2>
                <button
                  onClick={closeMediaModal} // Close media modal
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Media items grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mediaItems.length > 0 ? (
                  mediaItems.map((media) => (
                    <div
                      key={media.id} // Unique key for each media item
                      onClick={() => selectMedia(media.url)} // Select media on click
                      className="cursor-pointer bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors"
                    >
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-32 object-cover"
                      />
                      <p className="p-2 text-sm text-gray-300 truncate">{media.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-300">No media available</p>
                )}
              </div>
              {/* Media modal buttons */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={closeMediaModal} // Cancel media selection
                  className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination controls (bottom) */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-300">
          <span>Total Places: {total}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))} // Go to previous page
              disabled={page === 1} // Disable if on first page
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)} // Go to next page
              disabled={page >= totalPages} // Disable if on last page
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}