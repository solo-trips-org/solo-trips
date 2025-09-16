"use client";

import { useState, useEffect } from "react";
import { Pencil, Eye, Trash2, Plus, X } from "lucide-react";

// Types based on backend schema
type User = {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
  __v: number;
};

const API_BASE = "https://trips-api.tselven.com/api/users";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({});

  // Fetch Users
  const fetchUsers = async (pageNum: number = page, limitNum: number = limit) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}?limit=${limitNum}&page=${pageNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const { data, meta } = await res.json();
      setUsers(data || []);
      setTotal(meta?.total || 0);
      setTotalPages(meta?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const openModal = (mode: "add" | "edit" | "view", user?: User) => {
    setModalMode(mode);
    if (mode === "add") {
      setFormData({ username: "", email: "", password: "", role: "user" });
    } else if (user) {
      setSelectedUser(user);
      setFormData({ ...user, password: "" }); // Don't show password
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(formData),
        });
      } else if (modalMode === "edit" && selectedUser?._id) {
        await fetch(`${API_BASE}/${selectedUser._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(formData),
        });
      }
      fetchUsers();
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchUsers();
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
          <h1 className="text-2xl font-bold">Users Dashboard</h1>
          <button onClick={() => openModal("add")} className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
            <Plus /> Add New User
          </button>
        </div>

        <table className="w-full text-left text-sm bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-700/50 transition">
                <td className="px-4 py-2">{user._id.slice(-6)}</td>
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => openModal("edit", user)} className="p-2 bg-yellow-600 rounded hover:bg-yellow-500"><Pencil size={16} /></button>
                  <button onClick={() => openModal("view", user)} className="p-2 bg-blue-600 rounded hover:bg-blue-500"><Eye size={16} /></button>
                  <button onClick={() => deleteUser(user._id)} className="p-2 bg-red-600 rounded hover:bg-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span>Total Users: {total}</span>
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
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalMode === "add" ? "Add User" : modalMode === "edit" ? "Edit User" : "View User"}
              </h2>
              <button onClick={closeModal}><X size={24} /></button>
            </div>

            {modalMode === "view" && selectedUser ? (
              <div className="space-y-2 text-gray-300">
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm">Username</label>
                  <input
                    name="username"
                    value={formData.username || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {modalMode === "add" && (
                  <div>
                    <label className="block text-sm">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm">Role</label>
                  <select
                    name="role"
                    value={formData.role || "user"}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
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
                    {modalMode === "add" ? "Create User" : "Update User"}
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

