import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { base } from "../helper";

const SectionCard = ({ title, children, action }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const Table = ({ columns, rows, keyField = "_id" }) => (
  <div className="overflow-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          {columns.map((c) => (
            <th key={c.key} className="py-2 pr-3 whitespace-nowrap">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => (
          <tr key={row[keyField]} className="align-top">
            {columns.map((c) => (
              <td key={c.key} className="py-2 pr-3">
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
    await axios.post(
      `${base}/users/${id}/toggle-ban`,
      {},
      { withCredentials: true }
    );
    await fetchAll();
  };

  const updateBookingStatus = async (id, status) => {
    await axios.put(
      `${base}/bookings/${id}/status`,
      { status },
      { withCredentials: true }
    );
    await fetchAll();
  };

  const approveVenue = async (id) => {
    await axios.post(
      `${base}/venues/${id}/approve`,
      {},
      { withCredentials: true }
    );
    await fetchAll();
  };
  const rejectVenue = async (id) => {
    await axios.post(
      `${base}/venues/${id}/reject`,
      { reason: "Insufficient info" },
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
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Management
          </h1>
          <p className="text-slate-600">Manage users, venues, and bookings</p>
        </div>

        <SectionCard title="Users">
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              {
                key: "role",
                label: "Role",
                render: (r) => <span className="capitalize">{r.role}</span>,
              },
              {
                key: "status",
                label: "Status",
                render: (r) => (r.isBanned ? "Banned" : "Active"),
              },
              {
                key: "action",
                label: "Action",
                render: (r) => (
                  <button
                    onClick={() => toggleBan(r._id)}
                    className={`px-3 py-1 rounded text-white text-xs ${
                      r.isBanned
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {r.isBanned ? "Unban" : "Ban"}
                  </button>
                ),
              },
            ]}
            rows={users}
          />
        </SectionCard>

        <SectionCard title="Venues">
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "address", label: "Address" },
              {
                key: "status",
                label: "Status",
                render: (r) => <span className="capitalize">{r.status}</span>,
              },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveVenue(r._id)}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectVenue(r._id)}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      Reject
                    </button>
                  </div>
                ),
              },
            ]}
            rows={venues}
          />
        </SectionCard>

        <SectionCard title="Bookings">
          <Table
            columns={[
              {
                key: "user",
                label: "User",
                render: (r) => r.user?.name || r.user?.email || "-",
              },
              {
                key: "venue",
                label: "Venue",
                render: (r) => r.venue?.name || r.court,
              },
              {
                key: "date",
                label: "Date",
                render: (r) => new Date(r.date).toLocaleDateString(),
              },
              {
                key: "status",
                label: "Status",
                render: (r) => <span className="capitalize">{r.status}</span>,
              },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="flex flex-wrap gap-2">
                    {["confirmed", "completed", "cancelled", "no-show"].map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => updateBookingStatus(r._id, s)}
                          className="px-2 py-1 rounded border border-slate-200 text-xs hover:bg-slate-50"
                        >
                          {s}
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
      </div>
    </div>
  );
};

export default AdminManagement;
