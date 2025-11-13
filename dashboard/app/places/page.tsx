'use client';

import { useState, useEffect } from "react";
import { Pencil, Eye, Trash2, Plus, X } from "lucide-react";

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
  type: "Point";
  coordinates: [number, number];
};

type Place = {
  _id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  address: Address;
  openingHours: string;
  fees: Fees;
  visitDuration: VisitDuration;
  location: Location;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Media = {
  _id: string;
  url: string;
  originalName: string;
  mimeType: string;
};

const API_BASE = "https://trips-api.tselven.com/api/places";
const MEDIA_API = "https://trips-api.tselven.com/api/media";

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState<Partial<Place>>({});
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);

  useEffect(() => {
    fetchPlaces();
  }, [page]);

  const fetchPlaces = async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}?limit=${limitNum}&page=${pageNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const { data, meta } = await response.json();
      setPlaces(Array.isArray(data) ? data : []);
      setTotal(meta?.total || 0);
      setTotalPages(meta?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(MEDIA_API, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch media");
      const data = await response.json();
      setMediaItems(Array.isArray(data) ? data : []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to fetch media");
    }
  };

  const createPlace = async (newPlace: Omit<Place, "_id" | "createdAt" | "updatedAt" | "__v">) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newPlace),
      });
      if (!response.ok) throw new Error("Failed to create");
      await response.json();
      fetchPlaces();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create");
    }
  };

  const updatePlace = async (id: string, updates: Partial<Place>) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update");
      await response.json();
      fetchPlaces();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const deletePlace = async (id: string) => {
    if (!confirm("Are you sure you want to delete this place?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to delete");
      fetchPlaces();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const getPlace = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch");
      return await response.json() as Place;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to fetch");
      return null;
    }
  };

  const openModal = async (mode: "add" | "edit" | "view", place?: Place) => {
    setModalMode(mode);
    if (mode === "add") {
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
      const fullPlace = await getPlace(place._id);
      setSelectedPlace(fullPlace || place);
      setFormData(fullPlace || place || {});
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPlace(null);
    setFormData({});
  };

  const openMediaModal = async () => {
    await fetchMedia();
    setMediaModalOpen(true);
  };

  const closeMediaModal = () => {
    setMediaModalOpen(false);
  };

  const selectMedia = (url: string) => {
    setFormData({ ...formData, image: url });
    setMediaModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "add") {
      await createPlace(formData as Omit<Place, "_id" | "createdAt" | "updatedAt" | "__v">);
    } else if (modalMode === "edit" && selectedPlace?._id) {
      await updatePlace(selectedPlace._id, formData);
    }
    closeModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    const keys = name.split(".");
    let updatedForm = { ...formData };
    let current: any = updatedForm;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value;
    setFormData(updatedForm);
  };

  const handleCoordChange = (index: 0 | 1, value: string) => {
    const coords = [...(formData.location?.coordinates || [0, 0])];
    coords[index] = parseFloat(value) || 0;
    setFormData({
      ...formData,
      location: { type: "Point", coordinates: coords as [number, number] },
    });
  };

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-gradient-to-b from-gray-900 to-black">
        <div className="loader-container text-center position-relative">
          <div className="globe mx-auto"></div>
          <div className="loader-text text-center">Discover the World</div>
          <div className="loader-subtext text-center">Your adventure awaits...</div>
        </div>

        <style jsx>{`
          
          .globe::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 20px rgba(255,255,255,0.8);
            animation: glow 1.5s ease-in-out infinite;
          }
          .globe::after {
            content: '';
            position: absolute;
            top: 15%;
            left: 50%;
            width: 70px;
            height: 70px;
            border: 2px dashed rgba(255,255,255,0.6);
            border-radius: 50%;
            transform: translateX(-50%);
            animation: spin-reverse 3s linear infinite;
          }
          .loader-text {
            margin-top: 20px;
            font-size: 1.8rem;
            font-weight: bold;
            letter-spacing: 3px;
            color: #fff;
            animation: fade 1.5s ease-in-out infinite;
          }
          .loader-subtext {
            margin-top: 10px;
            font-size: 1.2rem;
            color: #fff;
            opacity: 0.9;
            animation: slide-up 1s ease-out;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            0% { transform: translateX(-50%) rotate(360deg); }
            100% { transform: translateX(-50%) rotate(0deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.8); }
            50% { box-shadow: 0 0 30px rgba(255,255,255,1); }
          }
          @keyframes fade {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes slide-up {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 0.9; }
          }
          @media (max-width: 576px) {
            .globe {
              width: 80px;
              height: 80px;
            }
            .loader-text {
              font-size: 1.5rem;
            }
            .loader-subtext {
              font-size: 1rem;
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Places Dashboard</h1>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Plus className="w-5 h-5" /> Add New Place
          </button>
        </div>

        <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
          <span>Total Places: {total}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>

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
                    key={place._id}
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
                        onClick={() => openModal("edit", place)}
                        className="p-2 bg-yellow-600/80 hover:bg-yellow-600 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal("view", place)}
                        className="p-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePlace(place._id)}
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

        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {modalMode === "add"
                    ? "Add Place"
                    : modalMode === "edit"
                    ? "Edit Place"
                    : "View Place"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {modalMode === "view" && selectedPlace ? (
                <div className="space-y-4 text-gray-300">
                  <p><strong>Name:</strong> {selectedPlace.name}</p>
                  <p><strong>Description:</strong> {selectedPlace.description}</p>
                  <p><strong>Category:</strong> {selectedPlace.category}</p>
                  {selectedPlace.image && (
                    <div>
                      <strong>Image:</strong>
                      <img
                        src={selectedPlace.image}
                        alt={selectedPlace.name}
                        className="w-full h-48 object-cover rounded mt-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-1 break-all">{selectedPlace.image}</p>
                    </div>
                  )}
                  <p>
                    <strong>Address:</strong> {selectedPlace.address.street},{" "}
                    {selectedPlace.address.city}, {selectedPlace.address.state},{" "}
                    {selectedPlace.address.zipCode}, {selectedPlace.address.country}
                  </p>
                  <p><strong>Opening Hours:</strong> {selectedPlace.openingHours}</p>
                  <p>
                    <strong>Fees:</strong> Required: {selectedPlace.fees.required ? "Yes" : "No"}, Amount:{" "}
                    {selectedPlace.fees.amount} {selectedPlace.fees.currency}, Notes: {selectedPlace.fees.notes}
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
                  <p><strong>Created:</strong>{" "}
                    {new Date(selectedPlace.createdAt).toLocaleString()}</p>
                  <p><strong>Updated:</strong>{" "}
                    {new Date(selectedPlace.updatedAt).toLocaleString()}</p>
                </div>
              ) : (
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
                      onDoubleClick={openMediaModal}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                      placeholder="Double-click to select from media library"
                    />
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Min Visit (minutes)</label>
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
                      <label className="block text-sm font-medium mb-1">Max Visit (minutes)</label>
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
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
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

        {mediaModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Select Media</h2>
                <button
                  onClick={closeMediaModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mediaItems.length > 0 ? (
                  mediaItems.map((media) => (
                    <div
                      key={media._id}
                      onClick={() => selectMedia(media.url)}
                      className="cursor-pointer bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors"
                    >
                      {media.mimeType?.startsWith("image/") ? (
                        <img
                          src={media.url}
                          alt={media.originalName}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-gray-600">
                          <p className="text-sm text-gray-300">{media.originalName}</p>
                        </div>
                      )}
                      <p className="p-2 text-sm text-gray-300 truncate">{media.originalName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-300 col-span-3 text-center py-8">No media available</p>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={closeMediaModal}
                  className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 text-sm text-gray-300">
          <span>Total Places: {total}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
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