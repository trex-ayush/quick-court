import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { base } from "../helper";
import Breadcrumb from "../components/Breadcrumb";

const SectionCard = ({ title, children, action, icon, description }) => (
  <div className="group rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300/60">
    <div className="border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 text-white shadow-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && (
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Table = ({ columns, rows, keyField = "_id" }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-slate-200">
        {rows.map((row, index) => (
          <tr
            key={row[keyField]}
            className={`transition-colors hover:bg-slate-50 ${
              index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
            }`}
          >
            {columns.map((c) => (
              <td key={c.key} className="px-6 py-4 text-sm text-slate-900">
                {typeof c.render === "function" ? c.render(row) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersRes, venuesRes, bookingsRes] = await Promise.all([
        axios.get(`${base}/users`, { withCredentials: true }),
        axios.get(`${base}/venues`, { withCredentials: true }),
        axios.get(`${base}/bookings`, { withCredentials: true }),
      ]);
      setUsers(usersRes.data?.data || []);
      const venuesList = Array.isArray(venuesRes.data?.data)
        ? venuesRes.data.data
        : Array.isArray(venuesRes.data)
        ? venuesRes.data
        : [];
      setVenues(venuesList);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const toggleBan = async (id) => {
    try {
      await axios.post(
        `${base}/users/${id}/toggle-ban`,
        {},
        { withCredentials: true }
      );
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to toggle user ban");
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(
        `${base}/bookings/${id}/status`,
        { status },
        { withCredentials: true }
      );
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to update booking status");
    }
  };

  const approveVenue = async (id) => {
    try {
      await axios.post(
        `${base}/venues/${id}/approve`,
        {},
        { withCredentials: true }
      );
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to approve venue");
    }
  };

  const rejectVenue = async (id) => {
    try {
      await axios.post(
        `${base}/venues/${id}/reject`,
        { reason: "Insufficient info" },
        { withCredentials: true }
      );
      await fetchAll();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to reject venue");
    }
  };

  const navigateToDashboard = () => {
    window.location.href = "/admin/dashboard";
  };

  const getStatusBadge = (status, type = "default") => {
    const statusStyles = {
      active: "bg-green-100 text-green-700",
      banned: "bg-red-100 text-red-700",
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      "no-show": "bg-slate-100 text-slate-700",
      default: "bg-slate-100 text-slate-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${
          statusStyles[status.toLowerCase()] || statusStyles.default
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl" />
              ))}
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

  const tabs = [
    { id: "users", label: "Users", count: users.length },
    { id: "venues", label: "Venues", count: venues.length },
    { id: "bookings", label: "Bookings", count: bookings.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb />
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Management
            </h1>
            <p className="mt-2 text-slate-600">
              Comprehensive management of users, venues, and bookings
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={navigateToDashboard}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium rounded-lg shadow-lg hover:from-slate-700 hover:to-slate-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === "users" && (
            <SectionCard
              title="User Management"
              description="Manage user accounts, roles, and access permissions"
              icon={
                <svg
                  className="h-5 w-5"
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
            >
              <Table
                columns={[
                  {
                    key: "name",
                    label: "User Details",
                    render: (r) => (
                      <div>
                        <div className="font-medium text-slate-900">
                          {r.name}
                        </div>
                        <div className="text-slate-500 text-xs">{r.email}</div>
                      </div>
                    ),
                  },
                  {
                    key: "role",
                    label: "Role",
                    render: (r) => (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 capitalize">
                        {r.role}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (r) =>
                      getStatusBadge(r.isBanned ? "banned" : "active"),
                  },
                  {
                    key: "createdAt",
                    label: "Join Date",
                    render: (r) =>
                      r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : "-",
                  },
                  {
                    key: "action",
                    label: "Actions",
                    render: (r) => (
                      <button
                        onClick={() => toggleBan(r._id)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                          r.isBanned
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
                            : "bg-red-600 text-white hover:bg-red-700 shadow-lg"
                        }`}
                      >
                        {r.isBanned ? (
                          <>
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Unban
                          </>
                        ) : (
                          <>
                            <svg
                              className="mr-1 h-3 w-3"
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
                            Ban
                          </>
                        )}
                      </button>
                    ),
                  },
                ]}
                rows={users}
              />
            </SectionCard>
          )}

          {activeTab === "venues" && (
            <SectionCard
              title="Venue Management"
              description="Review, approve, and manage venue listings"
              icon={
                <svg
                  className="h-5 w-5"
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
            >
              <Table
                columns={[
                  {
                    key: "name",
                    label: "Venue Details",
                    render: (r) => (
                      <div>
                        <div className="font-medium text-slate-900">
                          {r.name}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {r.address || "Address not provided"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "owner",
                    label: "Owner",
                    render: (r) => r.owner?.name || r.owner?.email || "N/A",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (r) => getStatusBadge(r.status),
                  },
                  {
                    key: "createdAt",
                    label: "Listed Date",
                    render: (r) =>
                      r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : "-",
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (r) => (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveVenue(r._id)}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          <svg
                            className="mr-1 h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => rejectVenue(r._id)}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          <svg
                            className="mr-1 h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Reject
                        </button>
                      </div>
                    ),
                  },
                ]}
                rows={venues}
              />
            </SectionCard>
          )}

          {activeTab === "bookings" && (
            <SectionCard
              title="Booking Management"
              description="Monitor and manage all venue bookings"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            >
              <Table
                columns={[
                  {
                    key: "user",
                    label: "Customer",
                    render: (r) => (
                      <div>
                        <div className="font-medium text-slate-900">
                          {r.user?.name || "N/A"}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {r.user?.email || "-"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "venue",
                    label: "Venue/Court",
                    render: (r) => (
                      <div>
                        <div className="font-medium text-slate-900">
                          {r.venue?.name || "N/A"}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {r.court || "-"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "date",
                    label: "Booking Date",
                    render: (r) => (
                      <div>
                        <div className="font-medium text-slate-900">
                          {new Date(r.date).toLocaleDateString()}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {r.timeSlot && (r.timeSlot.start || r.timeSlot.end)
                            ? `${r.timeSlot.start || "--:--"} - ${
                                r.timeSlot.end || "--:--"
                              }`
                            : "--:--"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    render: (r) => (r.amount ? `₹${r.amount}` : "-"),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (r) => getStatusBadge(r.status),
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (r) => (
                      <div className="flex flex-wrap gap-1">
                        {["confirmed", "completed", "cancelled", "no-show"].map(
                          (s) => (
                            <button
                              key={s}
                              onClick={() => updateBookingStatus(r._id, s)}
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                                r.status === s
                                  ? "bg-indigo-600 text-white shadow-md"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                              }`}
                            >
                              {s.charAt(0).toUpperCase() +
                                s.slice(1).replace("-", " ")}
                            </button>
                          )
                        )}
                      </div>
                    ),
                  },
                ]}
                rows={bookings}
              />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
