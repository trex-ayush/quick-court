import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { base } from "../helper";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const StatCard = ({ label, value, trend }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="text-slate-500 text-sm">{label}</div>
    <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    {trend !== undefined && (
      <div className="mt-1 text-xs text-emerald-600">{trend} last 7d</div>
    )}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, usersRes, venuesRes] = await Promise.all([
        axios.get(`${base}/users/stats/admin`, { withCredentials: true }),
        axios.get(`${base}/users`, { withCredentials: true }),
        axios.get(`${base}/venues`, { withCredentials: true }),
      ]);
      setStats(statsRes.data?.data || null);
      setUsers(usersRes.data?.data || []);
      const venuesList = Array.isArray(venuesRes.data?.data)
        ? venuesRes.data.data
        : Array.isArray(venuesRes.data)
        ? venuesRes.data
        : [];
      setVenues(venuesList);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const bookingsLineData = useMemo(() => {
    const labels = (stats?.bookings?.trend || []).map((t) => t._id);
    const values = (stats?.bookings?.trend || []).map((t) => t.count);
    return {
      labels,
      datasets: [
        {
          label: "Bookings (7d)",
          data: values,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79,70,229,0.15)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [stats]);

  const venuesDoughnutData = useMemo(() => {
    const approved = stats?.venues?.approved || 0;
    const pending = stats?.venues?.pending || 0;
    const others = Math.max(
      (stats?.venues?.total || 0) - approved - pending,
      0
    );
    return {
      labels: ["Approved", "Pending", "Other"],
      datasets: [
        {
          data: [approved, pending, others],
          backgroundColor: ["#10b981", "#f59e0b", "#94a3b8"],
        },
      ],
    };
  }, [stats]);

  const toggleBan = async (userId) => {
    await axios.post(
      `${base}/users/${userId}/toggle-ban`,
      {},
      { withCredentials: true }
    );
    await fetchAll();
  };

  const approveVenue = async (venueId) => {
    await axios.post(
      `${base}/venues/${venueId}/approve`,
      {},
      { withCredentials: true }
    );
    await fetchAll();
  };

  const rejectVenue = async (venueId) => {
    await axios.post(
      `${base}/venues/${venueId}/reject`,
      { reason: "Not eligible" },
      { withCredentials: true }
    );
    await fetchAll();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="rounded border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Overview of platform activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Users" value={stats?.users?.total || 0} />
          <StatCard label="Banned Users" value={stats?.users?.banned || 0} />
          <StatCard label="Venues" value={stats?.venues?.total || 0} />
          <StatCard label="Bookings" value={stats?.bookings?.total || 0} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <h3 className="font-semibold mb-2">Bookings (last 7 days)</h3>
            <Line
              data={bookingsLineData}
              options={{ responsive: true, maintainAspectRatio: false }}
              height={220}
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold mb-2">Venues status</h3>
            <Doughnut data={venuesDoughnutData} />
          </div>
        </div>

        {/* Admin tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Users</h3>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.slice(0, 8).map((u) => (
                    <tr key={u._id}>
                      <td className="py-2 pr-3">{u.name}</td>
                      <td className="py-2 pr-3">{u.email}</td>
                      <td className="py-2 pr-3 capitalize">{u.role}</td>
                      <td className="py-2 pr-3">
                        {u.isBanned ? "Banned" : "Active"}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => toggleBan(u._id)}
                          className={`px-3 py-1 rounded text-white text-xs ${
                            u.isBanned
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Venues moderation */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Venue Moderation</h3>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Venue</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {venues
                    .filter((v) => v.status !== "approved")
                    .slice(0, 8)
                    .map((v) => (
                      <tr key={v._id}>
                        <td className="py-2 pr-3">{v.name}</td>
                        <td className="py-2 pr-3 capitalize">{v.status}</td>
                        <td className="py-2 flex gap-2">
                          <button
                            onClick={() => approveVenue(v._id)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectVenue(v._id)}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
