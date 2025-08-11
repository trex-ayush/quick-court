import React, { useEffect, useState } from "react";
import axios from "axios";
import { base } from "../helper";
import Breadcrumb from "../components/Breadcrumb";

const AdminSports = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchSports = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${base}/sports`);
      setSports(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load sports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const resetForm = () => setForm({ name: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Sport name is required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (editingId) {
        await axios.put(
          `${base}/sports/${editingId}`,
          { name: form.name.trim(), description: form.description.trim() },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${base}/sports/addSport`,
          { name: form.name.trim(), description: form.description.trim() },
          { withCredentials: true }
        );
      }
      resetForm();
      setEditingId(null);
      await fetchSports();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to save sport");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id || s.id);
    setForm({ name: s.name || "", description: s.description || "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this sport?")) return;
    try {
      await axios.delete(`${base}/sports/${id}`, { withCredentials: true });
      await fetchSports();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to delete sport");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb />
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Sports Management
          </h1>
          <p className="text-slate-600">Add, update, and remove sports</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sport Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Badminton"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {editingId
                ? saving
                  ? "Updating..."
                  : "Update Sport"
                : saving
                ? "Adding..."
                : "Add Sport"}
            </button>
            {editingId && (
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
            )}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </form>

        {/* List */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            All Sports
          </h3>
          {loading ? (
            <div className="h-32 bg-slate-100 rounded animate-pulse" />
          ) : sports.length === 0 ? (
            <div className="text-slate-500 text-sm">No sports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {sports.map((s) => (
                    <tr key={s._id || s.id}>
                      <td className="px-4 py-2 font-medium text-slate-900 capitalize">
                        {s.name}
                      </td>
                      <td className="px-4 py-2 text-slate-600 text-sm">
                        {s.description || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(s)}
                            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s._id || s.id)}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSports;
