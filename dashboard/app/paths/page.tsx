"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

interface Place {
  _id: string;
  name: string;
}

interface Path {
  from: { mongoId: string };
  to: { mongoId: string };
  path: {
    mode: string;
    distance: number;
    isOneway: boolean;
  };
}

export default function PathsPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [fromPlace, setFromPlace] = useState<Place | null>(null);
  const [toPlace, setToPlace] = useState<Place | null>(null);
  const [mode, setMode] = useState("road");
  const [distance, setDistance] = useState<number>(0);
  const [isOneway, setIsOneway] = useState(false);
  const [direction, setDirection] = useState("both");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const baseUrl = "https://trips-api.tselven.com";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    if (!token) return;
    fetch(`${baseUrl}/api/places`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPlaces(Array.isArray(data) ? data : data.data || []))
      .catch((err) => console.error("Failed to fetch places:", err));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${baseUrl}/api/paths`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPaths(data || []))
      .catch((err) => console.error("Failed to fetch paths:", err));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPlace || !toPlace) {
      setMessage("Please select both From and To places.");
      return;
    }
    if (!token) {
      setMessage("You are not authorized.");
      return;
    }

    const pathData = {
      fromPlaceId: fromPlace._id,
      toPlaceId: toPlace._id,
      mode,
      distance,
      isOneway,
      direction,
    };

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${baseUrl}/api/paths`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pathData),
      });

      if (res.ok) {
        setMessage("Path added successfully!");
        const updated = await fetch(`${baseUrl}/api/paths`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());
        setPaths(updated || []);
        setFromPlace(null);
        setToPlace(null);
        setMode("road");
        setDistance(0);
        setIsOneway(false);
        setDirection("both");
      } else {
        const error = await res.json();
        setMessage(`Error: ${error.message || "Failed to add path."}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error submitting path.");
    } finally {
      setLoading(false);
    }
  };

  const placeOptions = places.map((place) => ({ value: place._id, label: place.name }));
  const getPlaceName = (id: string) => places.find((p) => p._id === id)?.name || id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black  p-6 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-white py-3">🌍 Manage Paths</h1>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Add New Path</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-600">From Place</label>
            <Select
              options={placeOptions}
              value={fromPlace ? { value: fromPlace._id, label: fromPlace.name } : null}
              onChange={(option) => setFromPlace(places.find((p) => p._id === option?.value) || null)}
              isSearchable
              placeholder="Select From Place..."
              className="rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-600">To Place</label>
            <Select
              options={placeOptions}
              value={toPlace ? { value: toPlace._id, label: toPlace.name } : null}
              onChange={(option) => setToPlace(places.find((p) => p._id === option?.value) || null)}
              isSearchable
              placeholder="Select To Place..."
              className="rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-600">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="road">Road</option>
              <option value="rail">Rail</option>
              <option value="air">Air</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-600">Distance (km)</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="w-full border p-2 rounded-lg"
              step="0.1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isOneway}
              onChange={(e) => setIsOneway(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
            <span className="font-medium text-gray-600">Is Oneway?</span>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-600">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="both">Both</option>
              <option value="from">From</option>
              <option value="to">To</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Saving..." : "Add Path"}
            </button>
            {message && <p className="mt-2 text-red-600">{message}</p>}
          </div>
        </form>
      </div>

      {/* Paths List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5">
        {paths.map((p, idx) => (
          <div key={idx} className="bg-white shadow-lg rounded-2xl p-5 hover:shadow-xl transition">
            <h3 className="font-semibold text-lg mb-2">
              {getPlaceName(p.from.mongoId)} → {getPlaceName(p.to.mongoId)}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Mode: {p.path.mode}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">Distance: {p.path.distance} km</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Oneway: {p.path.isOneway ? "Yes" : "No"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
