"use client";

import { useState, useEffect } from "react";
import { Pencil, Eye, Trash2, Plus, X } from "lucide-react";

type Address = { street: string; city: string; state: string; zipCode: string; country: string };
type Location = { type: "Point"; coordinates: [number, number] };
type Hotel = {
  _id: string;
  name: string;
  category: string;
  type: "Hotel" | "Restaurent";
  address: Address;
  image: string;
  description: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const API_BASE = "https://trips-api.tselven.com/api/hotels";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<Partial<Hotel>>({});

  const fetchHotels = async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}?limit=${limitNum}&page=${pageNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch hotels");
      const { data, meta } = await res.json();
      setHotels(data || []);
      setTotal(meta?.total || 0);
      setTotalPages(meta?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [page]);

  const openModal = (mode: "add" | "edit" | "view", hotel?: Hotel) => {
    setModalMode(mode);
    if (mode === "add") {
      setFormData({
        name: "",
        category: "",
        type: "Hotel",
        image: "",
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        description: "",
        location: { type: "Point", coordinates: [0, 0] },
      });
    } else if (hotel) {
      setSelectedHotel(hotel);
      setFormData(hotel);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedHotel(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    let updated: any = { ...formData };
    let curr = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) curr[keys[i]] = {};
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = value;
    setFormData(updated);
  };

  const handleCoordChange = (index: 0 | 1, value: string) => {
    const coords = [...(formData.location?.coordinates || [0, 0])];
    coords[index] = parseFloat(value) || 0;
    setFormData({ ...formData, location: { type: "Point", coordinates: coords as [number, number] } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (modalMode === "add") {
        await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(formData),
        });
      } else if (modalMode === "edit" && selectedHotel?._id) {
        await fetch(`${API_BASE}/${selectedHotel._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(formData),
        });
      }
      fetchHotels();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteHotel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchHotels();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Hotels Dashboard</h1>
          <button onClick={() => openModal("add")} className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
            <Plus /> Add New Hotel
          </button>
        </div>

        <table className="w-full text-left text-sm bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Coordinates</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {hotels.map((hotel) => (
              <tr key={hotel._id} className="hover:bg-gray-700/50 transition">
                <td className="px-4 py-2">{hotel._id.slice(-6)}</td>
                <td className="px-4 py-2">{hotel.name}</td>
                <td className="px-4 py-2">{hotel.category}</td>
                <td className="px-4 py-2">{hotel.type}</td>
                <td className="px-4 py-2">{hotel.address.city}</td>
                <td className="px-4 py-2">[{hotel.location.coordinates[0].toFixed(4)}, {hotel.location.coordinates[1].toFixed(4)}]</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => openModal("edit", hotel)} className="p-2 bg-yellow-600 rounded hover:bg-yellow-500"><Pencil size={16} /></button>
                  <button onClick={() => openModal("view", hotel)} className="p-2 bg-blue-600 rounded hover:bg-blue-500"><Eye size={16} /></button>
                  <button onClick={() => deleteHotel(hotel._id)} className="p-2 bg-red-600 rounded hover:bg-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span>Total: {total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{modalMode === "add" ? "Add Hotel" : modalMode === "edit" ? "Edit Hotel" : "View Hotel"}</h2>
              <button onClick={closeModal}><X size={24} /></button>
            </div>
            {modalMode === "view" && selectedHotel ? (
              <div className="text-gray-300 space-y-2">
                <p><strong>Name:</strong> {selectedHotel.name}</p>
                <p><strong>Type:</strong> {selectedHotel.type}</p>
                <p><strong>Category:</strong> {selectedHotel.category}</p>
                <img src={selectedHotel.image} className="w-full h-48 object-cover rounded" />
                <p><strong>Description:</strong> {selectedHotel.description}</p>
                <p><strong>Address:</strong> {selectedHotel.address.street}, {selectedHotel.address.city}, {selectedHotel.address.state}, {selectedHotel.address.zipCode}, {selectedHotel.address.country}</p>
                <p><strong>Coordinates:</strong> [{selectedHotel.location.coordinates[0]}, {selectedHotel.location.coordinates[1]}]</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input name="name" value={formData.name || ""} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <input name="category" value={formData.category || ""} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <select name="type" value={formData.type || "Hotel"} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                    <option value="Hotel">Hotel</option>
                    <option value="Restaurent">Restaurent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Image URL</label>
                  <input name="image" value={formData.image || ""} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea name="description" value={formData.description || ""} onChange={handleChange} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input name="address.street" value={formData.address?.street || ""} onChange={handleChange} placeholder="Street" className="p-2 rounded bg-gray-700 border border-gray-600" />
                  <input name="address.city" value={formData.address?.city || ""} onChange={handleChange} placeholder="City" className="p-2 rounded bg-gray-700 border border-gray-600" />
                  <input name="address.state" value={formData.address?.state || ""} onChange={handleChange} placeholder="State" className="p-2 rounded bg-gray-700 border border-gray-600" />
                  <input name="address.zipCode" value={formData.address?.zipCode || ""} onChange={handleChange} placeholder="Zip" className="p-2 rounded bg-gray-700 border border-gray-600" />
                  <input name="address.country" value={formData.address?.country || ""} onChange={handleChange} placeholder="Country" className="p-2 rounded bg-gray-700 border border-gray-600 col-span-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.0001" value={formData.location?.coordinates?.[0] || 0} onChange={(e) => handleCoordChange(0, e.target.value)} placeholder="Longitude" className="p-2 rounded bg-gray-700 border border-gray-600" />
                  <input type="number" step="0.0001" value={formData.location?.coordinates?.[1] || 0} onChange={(e) => handleCoordChange(1, e.target.value)} placeholder="Latitude" className="p-2 rounded bg-gray-700 border border-gray-600" />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500">{modalMode === "add" ? "Create" : "Update"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
