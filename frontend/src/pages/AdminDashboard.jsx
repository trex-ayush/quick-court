import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
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

const StatCard = ({ label, value, trend, icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    blue: "from-blue-500 to-blue-600",
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/60">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value.toLocaleString()}
          </p>
          {trend !== undefined && (
            <p className="mt-2 flex items-center text-sm text-emerald-600">
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              {trend} last 7d
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`rounded-lg bg-gradient-to-br ${colorClasses[color]} p-3 text-white shadow-lg`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

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
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#6366f1",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
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
          borderWidth: 0,
          hoverBackgroundColor: ["#059669", "#d97706", "#64748b"],
        },
      ],
    };
  }, [stats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#334155",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "#e2e8f0",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#334155",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  const toggleBan = async (userId) => {
    try {
      await axios.post(
        `${base}/users/${userId}/toggle-ban`,
        {},
        { withCredentials: true }
      );
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to toggle user ban");
    }
  };

  const approveVenue = async (venueId) => {
    try {
      await axios.post(
        `${base}/venues/${venueId}/approve`,
        {},
        { withCredentials: true }
      );
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to approve venue");
    }
  };

  const rejectVenue = async (venueId) => {
    try {
      await axios.post(
        `${base}/venues/${venueId}/reject`,
        { reason: "Not eligible" },
        { withCredentials: true }
      );
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to reject venue");
    }
  };

  const navigateToManage = () => {
    window.location.href = "/admin/manage";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-80 bg-slate-200 rounded-xl" />
              <div className="h-80 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-6 py-4 shadow-sm">
            <div className="flex items-center">
              <svg
                className="mr-3 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb />
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Monitor and manage platform activity
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={navigateToManage}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Advanced Management
            </button>
            <a
              href="/admin/sports"
              className="ml-3 inline-flex items-center px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Manage Sports
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Users"
            value={stats?.users?.total || 0}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            }
            color="indigo"
          />
          <StatCard
            label="Banned Users"
            value={stats?.users?.banned || 0}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                />
              </svg>
            }
            color="rose"
          />
          <StatCard
            label="Total Venues"
            value={stats?.venues?.total || 0}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
            color="emerald"
          />
          <StatCard
            label="Total Bookings"
            value={stats?.bookings?.total || 0}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            color="blue"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Booking Trends
              </h3>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                Last 7 days
              </span>
            </div>
            <div style={{ height: "280px" }}>
              <Line data={bookingsLineData} options={chartOptions} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Venue Status
              </h3>
              <p className="text-sm text-slate-600">
                Current venue distribution
              </p>
            </div>
            <div style={{ height: "280px" }}>
              <Doughnut data={venuesDoughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Management Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Management */}
          <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                User Management
              </h3>
              <p className="text-sm text-slate-600">
                Manage user accounts and permissions
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.slice(0, 8).map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {u.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {u.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            u.isBanned
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {u.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleBan(u._id)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            u.isBanned
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-red-600 text-white hover:bg-red-700"
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

          {/* Venue Moderation */}
          <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Venue Moderation
              </h3>
              <p className="text-sm text-slate-600">
                Review and approve venue listings
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {venues
                    .filter((v) => v.status !== "approved")
                    .slice(0, 8)
                    .map((v) => (
                      <tr
                        key={v._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {v.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${
                              v.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveVenue(v._id)}
                              className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectVenue(v._id)}
                              className="inline-flex items-center px-3 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
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
