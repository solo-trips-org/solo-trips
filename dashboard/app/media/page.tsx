"use client";

import { useEffect, useState, DragEvent, ChangeEvent } from "react";

interface Media {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  public: boolean;
  folder?: string;
  userId?: string;
  url: string;
  createdAt: string;
}

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) alert("No token found. Please log in first.");
    setToken(t);
  }, []);

  const fetchMedia = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("https://trips-api.tselven.com/api/media", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.statusText);
      const data: Media[] = await res.json();
      setMediaList(data);
    } catch (err) {
      console.error("Failed to fetch media", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file || !token) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("public", "true");

    try {
      setUploading(true);
      const res = await fetch("https://trips-api.tselven.com/api/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const newMedia: Media = await res.json();
      setMediaList((prev) => [newMedia, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      const res = await fetch(
        `https://trips-api.tselven.com/api/media/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Delete failed: ${errText}`);
      }

      // remove from state
      setMediaList((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed!");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (token) fetchMedia();
  }, [token]);

  const groupedMedia = mediaList.reduce(
    (groups: Record<string, Media[]>, media) => {
      const folder = media.folder || "Ungrouped";
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(media);
      return groups;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Media Manager</h1>

      {/* Upload Section */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p className="text-gray-400 mb-4">
          Drag & drop files here, or click below to upload
        </p>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={onFileChange}
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          {uploading ? "Uploading..." : "Select File"}
        </label>
      </div>

      {/* Media Library */}
      {loading ? (
        <p className="mt-6">Loading...</p>
      ) : mediaList.length === 0 ? (
        <p className="mt-6">No media found.</p>
      ) : (
        Object.entries(groupedMedia).map(([folder, items]) => (
          <div key={folder} className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{folder}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((media) => (
                <div
                  key={media._id}
                  className="border rounded-lg shadow p-4 bg-white text-black"
                >
                  {media.mimeType.startsWith("image/") ? (
                    <img
                      src={media.url}
                      alt={media.originalName}
                      className="w-full h-48 object-cover rounded"
                    />
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-600">
                      {media.originalName}
                    </div>
                  )}

                  <p className="mt-2 font-medium">{media.originalName}</p>
                  <p className="text-sm text-gray-500">
                    {(media.size / 1024).toFixed(1)} KB
                  </p>

                  <div className="flex gap-2 mt-3">
                    {/* Separate Copy URL Button */}
                    <button
                      onClick={() => copyUrl(media.url)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      Copy URL
                    </button>

                    {/* Separate Delete Button */}
                    <button
                      onClick={() => deleteMedia(media._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
