"use client";

import { useState, useEffect } from "react";
import { Pencil, Eye, Trash2, Plus, X } from "lucide-react";

// Types based on backend Guide model
type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type Guide = {
  _id: string;
  name: string;
  phone: string;
  gender: "male" | "female" | "other";
  address: Address;
  languages: string[];
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

const API_BASE = "https://trips-api.tselven.com/api/guides";
const MEDIA_API = "https://trips-api.tselven.com/api/media";

type MediaItem = {
  _id: string;
  url: string;
  originalName: string;
  mimeType: string;
};

export default function GuidersPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [formData, setFormData] = useState<Partial<Guide> & { languagesInput?: string }>({});

  // Media modal states
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Fetch Guides
  const fetchGuides = async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}?limit=${limitNum}&page=${pageNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch guides");
      const { data, meta } = await res.json();
      setGuides(data || []);
      setTotal(meta?.total || 0);
      setTotalPages(meta?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openModal = (mode: "add" | "edit" | "view", guide?: Guide) => {
    setModalMode(mode);
    if (mode === "add") {
      setFormData({
        name: "",
        phone: "",
        gender: "male",
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        languages: [],
        contactInfo: "",
        languagesInput: "",
      });
    } else if (guide) {
      setSelectedGuide(guide);
      setFormData({
        ...guide,
        languagesInput: guide.languages?.join(", ") || "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedGuide(null);
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
    setFormData({ ...formData, contactInfo: url });
    setMediaModalOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const languagesArray = value.split(",").map((lang) => lang.trim()).filter((lang) => lang);
    setFormData({
      ...formData,
      languagesInput: value,
      languages: languagesArray,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const submitData = {
        ...formData,
        languages: formData.languages || [],
      };
      delete (submitData as any).languagesInput;

      if (modalMode === "add") {
        await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(submitData),
        });
      } else if (modalMode === "edit" && selectedGuide?._id) {
        await fetch(`${API_BASE}/${selectedGuide._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(submitData),
        });
      }
      fetchGuides();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteGuide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guide?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchGuides();
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
          <h1 className="text-2xl font-bold">Guiders Dashboard</h1>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          >
            <Plus /> Add New Guide
          </button>
        </div>

        <table className="w-full text-left text-sm bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Gender</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Languages</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {guides.length > 0 ? (
              guides.map((guide) => (
                <tr key={guide._id} className="hover:bg-gray-700/50 transition">
                  <td className="px-4 py-2">{guide._id.slice(-6)}</td>
                  <td className="px-4 py-2">{guide.name}</td>
                  <td className="px-4 py-2">{guide.phone}</td>
                  <td className="px-4 py-2 capitalize">{guide.gender}</td>
                  <td className="px-4 py-2">{guide.address?.city || "N/A"}</td>
                  <td className="px-4 py-2">{guide.languages?.join(", ") || "N/A"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => openModal("edit", guide)}
                      className="p-2 bg-yellow-600 rounded hover:bg-yellow-500"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => openModal("view", guide)}
                      className="p-2 bg-blue-600 rounded hover:bg-blue-500"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => deleteGuide(guide._id)}
                      className="p-2 bg-red-600 rounded hover:bg-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-400">
                  No guides found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span>Total Guides: {total}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
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
                {modalMode === "add" ? "Add Guide" : modalMode === "edit" ? "Edit Guide" : "View Guide"}
              </h2>
              <button onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            {modalMode === "view" && selectedGuide ? (
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>Name:</strong> {selectedGuide.name}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedGuide.phone}
                </p>
                <p>
                  <strong>Gender:</strong> {selectedGuide.gender}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedGuide.address
                    ? `${selectedGuide.address.street}, ${selectedGuide.address.city}, ${selectedGuide.address.state}, ${selectedGuide.address.zipCode}, ${selectedGuide.address.country}`
                    : "N/A"}
                </p>
                <p>
                  <strong>Languages:</strong> {selectedGuide.languages?.join(", ") || "N/A"}
                </p>
                <p>
                  <strong>Contact Info:</strong> {selectedGuide.contactInfo || "N/A"}
                </p>
                {selectedGuide.contactInfo && (
                  <div>
                    <strong>Contact Image:</strong>
                    <img
                      src={selectedGuide.contactInfo}
                      alt={selectedGuide.name}
                      className="w-full h-48 object-cover rounded mt-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1 break-all">{selectedGuide.contactInfo}</p>
                  </div>
                )}
                <p>
                  <strong>Created:</strong> {new Date(selectedGuide.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Updated:</strong> {new Date(selectedGuide.updatedAt).toLocaleString()}
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
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm">Phone</label>
                  <input
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || "male"}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
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
                  <label className="block text-sm">Languages (comma-separated)</label>
                  <input
                    name="languagesInput"
                    value={formData.languagesInput || ""}
                    onChange={handleLanguagesChange}
                    placeholder="e.g., Tamil, English, Sinhala"
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm">Contact Info</label>
                  <input
                    name="contactInfo"
                    value={formData.contactInfo || ""}
                    onChange={handleChange}
                    onDoubleClick={openMediaModal}
                    placeholder="Double-click to select from media library"
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
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
                    {modalMode === "add" ? "Create Guide" : "Update Guide"}
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
