"use client";
import { useState, useEffect } from "react";
import { Pencil, Eye, Trash2, Plus, X } from "lucide-react";

// TypeScript types based on backend Event model
type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type Schedule = {
  from: string;
  to: string;
};

type LocationType = {
  type: string;
  coordinates: [number, number];
};

type EventType = {
  _id: string;
  title: string; // Backend uses 'title', not 'name'
  description: string;
  schedule: Schedule; // Backend uses 'schedule' with 'from' and 'to', not 'date' and 'time'
  address: Address; // Backend uses 'address' object
  location: LocationType;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const API_BASE = "https://trips-api.tselven.com/api/events";
const MEDIA_API = "https://trips-api.tselven.com/api/media";

type MediaItem = {
  _id: string;
  url: string;
  originalName: string;
  mimeType: string;
};

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

  // Media modal states
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

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
      setFormData({
        title: "",
        description: "",
        schedule: { from: "", to: "" },
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        location: { type: "Point", coordinates: [0, 0] },
        image: "",
      });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...(formData.address || { street: "", city: "", state: "", zipCode: "", country: "" }),
          [addressField]: value,
        },
      });
    } else if (name.startsWith("schedule.")) {
      const scheduleField = name.split(".")[1];
      setFormData({
        ...formData,
        schedule: {
          ...(formData.schedule || { from: "", to: "" }),
          [scheduleField]: value,
        },
      });
    } else if (name.startsWith("location.coordinates.")) {
      const coordIndex = parseInt(name.split(".")[2]);
      const coords = formData.location?.coordinates || [0, 0];
      coords[coordIndex] = parseFloat(value) || 0;
      setFormData({
        ...formData,
        location: {
          type: "Point",
          coordinates: coords,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      // Format the data for backend (convert schedule strings to ISO dates)
      const submitData = {
        ...formData,
        schedule: formData.schedule
          ? {
              from: formData.schedule.from ? new Date(formData.schedule.from).toISOString() : "",
              to: formData.schedule.to ? new Date(formData.schedule.to).toISOString() : "",
            }
          : { from: "", to: "" },
        location: formData.location || { type: "Point", coordinates: [0, 0] },
      };

      if (modalMode === "add") {
        await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(submitData),
        });
      } else if (modalMode === "edit" && selectedEvent?._id) {
        await fetch(`${API_BASE}/${selectedEvent._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(submitData),
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
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-2">{event._id.slice(-6)}</td>
                  <td className="px-4 py-2">{event.title || "N/A"}</td>
                  <td className="px-4 py-2">{event.address?.city || "N/A"}</td>
                  <td className="px-4 py-2">
                    {event.schedule?.from ? new Date(event.schedule.from).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {event.schedule?.to ? new Date(event.schedule.to).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => openModal("edit", event)}
                      className="p-2 bg-yellow-600 rounded hover:bg-yellow-500"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => openModal("view", event)}
                      className="p-2 bg-blue-600 rounded hover:bg-blue-500"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="p-2 bg-red-600 rounded hover:bg-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No events found.
                </td>
              </tr>
            )}
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
                  <strong>Title:</strong> {selectedEvent.title}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description || "N/A"}
                </p>
                {selectedEvent.image && (
                  <div>
                    <strong>Image:</strong>
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-48 object-cover rounded mt-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1 break-all">{selectedEvent.image}</p>
                  </div>
                )}
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedEvent.address
                    ? `${selectedEvent.address.street}, ${selectedEvent.address.city}, ${selectedEvent.address.state} ${selectedEvent.address.zipCode}, ${selectedEvent.address.country}`
                    : "N/A"}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {selectedEvent.schedule?.from
                    ? new Date(selectedEvent.schedule.from).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {selectedEvent.schedule?.to
                    ? new Date(selectedEvent.schedule.to).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {selectedEvent.location?.coordinates
                    ? `Lat: ${selectedEvent.location.coordinates[1]}, Lng: ${selectedEvent.location.coordinates[0]}`
                    : "N/A"}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm">Title</label>
                  <input
                    name="title"
                    value={formData.title || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Address</label>
                  <div className="space-y-2">
                    <input
                      name="address.street"
                      placeholder="Street"
                      value={formData.address?.street || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <input
                      name="address.city"
                      placeholder="City"
                      value={formData.address?.city || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <input
                      name="address.state"
                      placeholder="State"
                      value={formData.address?.state || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <input
                      name="address.zipCode"
                      placeholder="Zip Code"
                      value={formData.address?.zipCode || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <input
                      name="address.country"
                      placeholder="Country"
                      value={formData.address?.country || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Schedule</label>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        name="schedule.from"
                        value={
                          formData.schedule?.from
                            ? new Date(formData.schedule.from).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">End Date & Time</label>
                      <input
                        type="datetime-local"
                        name="schedule.to"
                        value={
                          formData.schedule?.to
                            ? new Date(formData.schedule.to).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Location Coordinates</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        name="location.coordinates.0"
                        value={formData.location?.coordinates?.[0] || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Longitude"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        name="location.coordinates.1"
                        value={formData.location?.coordinates?.[1] || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Latitude"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image || ""}
                    onChange={handleChange}
                    onDoubleClick={openMediaModal}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                    placeholder="Double-click to select from media library"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
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
                    {modalMode === "add" ? "Create Event" : "Update Event"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Media Selector Modal */}
      {mediaModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Media</h2>
              <button onClick={closeMediaModal} className="text-gray-400 hover:text-white">
                <X size={24} />
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
    </div>
  );
}
