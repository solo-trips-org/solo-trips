import { useState, useEffect } from "react";
import { Pencil, Eye, Trash2 } from "lucide-react";

// TypeScript types
type Rating = {
  _id: string;
  userId: { _id: string; username: string };
  targetId: { _id: string; name: string }; // guide/place/event/hotel
  score: number;
  createdAt: string;
  updatedAt: string;
};

type RatingType = "guide" | "place" | "event" | "hotel";

const API_BASES: Record<RatingType, string> = {
  guide: "https://trips-api.tselven.com/api/ratings/guides",
  place: "https://trips-api.tselven.com/api/ratings/places",
  event: "https://trips-api.tselven.com/api/ratings/events",
  hotel: "https://trips-api.tselven.com/api/ratings/hotels",
};

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingType, setRatingType] = useState<RatingType>("guide");

  const fetchRatings = async (type: RatingType = ratingType, pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASES[type]}?limit=${limitNum}&page=${pageNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch ratings");
      const { data, meta } = await res.json();
      setRatings(data || []);
      setTotal(meta?.total || 0);
      setTotalPages(meta?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [page, ratingType]);

  const deleteRating = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rating?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASES[ratingType]}/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchRatings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-6 items-center">
          <h1 className="text-2xl font-bold">Ratings Dashboard</h1>
          <div className="flex gap-2">
            {(["guide", "place", "event", "hotel"] as RatingType[]).map((type) => (
              <button
                key={type}
                onClick={() => { setRatingType(type); setPage(1); }}
                className={`px-4 py-2 rounded ${ratingType === type ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Ratings
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-left text-sm bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Target</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {ratings.map((rating) => (
              <tr key={rating._id} className="hover:bg-gray-700/50 transition">
                <td className="px-4 py-2">{rating._id.slice(-6)}</td>
                <td className="px-4 py-2">{rating.userId?.username || "N/A"}</td>
                <td className="px-4 py-2">{rating.targetId?.name || "N/A"}</td>
                <td className="px-4 py-2">{rating.score}</td>
                <td className="px-4 py-2">{new Date(rating.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => alert(`View rating: ${rating.score}`)} className="p-2 bg-blue-600 rounded hover:bg-blue-500"><Eye size={16} /></button>
                  <button onClick={() => deleteRating(rating._id)} className="p-2 bg-red-600 rounded hover:bg-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span>Total Ratings: {total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
