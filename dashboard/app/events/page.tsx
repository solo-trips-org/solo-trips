"use client";
import { useState, useEffect } from "react";
import { Pencil, Eye, Trash2, Plus, X } from "lucide-react";

// TypeScript types
type LocationType = {
  type: string;
  coordinates: [number, number];
};

type EventType = {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string | LocationType;
  date: string;
  time: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const API_BASE = "https://trips-api.tselven.com/api/events";

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [formData, setFormData] = useState<Partial<EventType>>({});

  // Fetch Events
  const fetchEvents = async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}?limit=${limitNum}&page=${pageNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const { data, meta } = await res.json();
      setEvents(data || []);
      setTotal(meta?.total || 0);
      setTotalPages(meta?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const openModal = (mode: "add" | "edit" | "view", event?: EventType) => {
    setModalMode(mode);
    if (mode === "add") {
      setFormData({ name: "", description: "", category: "", location: "", date: "", time: "", image: "" });
    } else if (event) {
      setSelectedEvent(event);
      setFormData({ ...event });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setFormData({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (modalMode === "add") {
        await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(formData),
        });
      } else if (modalMode === "edit" && selectedEvent?._id) {
        await fetch(`${API_BASE}/${selectedEvent._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(formData),
        });
      }
      fetchEvents();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchEvents();
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
          <h1 className="text-2xl font-bold">Events Dashboard</h1>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          >
            <Plus /> Add New Event
          </button>
        </div>

        <table className="w-full text-left text-sm bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-700/50 transition">
                <td className="px-4 py-2">{event._id.slice(-6)}</td>
                <td className="px-4 py-2">{event.name}</td>
                <td className="px-4 py-2">{event.category}</td>
                <td className="px-4 py-2">
                  {typeof event.location === "string"
                    ? event.location
                    : `Lat: ${event.location.coordinates[1]}, Lng: ${event.location.coordinates[0]}`}
                </td>
                <td className="px-4 py-2">{new Date(event.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{event.time}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => openModal("edit", event)} className="p-2 bg-yellow-600 rounded hover:bg-yellow-500">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => openModal("view", event)} className="p-2 bg-blue-600 rounded hover:bg-blue-500">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => deleteEvent(event._id)} className="p-2 bg-red-600 rounded hover:bg-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span>Total Events: {total}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalMode === "add" ? "Add Event" : modalMode === "edit" ? "Edit Event" : "View Event"}
              </h2>
              <button onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            {modalMode === "view" && selectedEvent ? (
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>Name:</strong> {selectedEvent.name}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
                <p>
                  <strong>Category:</strong> {selectedEvent.category}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {typeof selectedEvent.location === "string"
                    ? selectedEvent.location
                    : `Lat: ${selectedEvent.location.coordinates[1]}, Lng: ${selectedEvent.location.coordinates[0]}`}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {selectedEvent.time}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm">Name</label>
                  <input
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm">Category</label>
                  <input
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm">Location</label>
                  <input
                    name="location"
                    value={typeof formData.location === "string" ? formData.location : ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date?.split("T")[0] || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500"
                  >
                    {modalMode === "add" ? "Create Event" : "Update Event"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
