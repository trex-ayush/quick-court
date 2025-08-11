import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Camera,
  Shield,
  Star,
  Settings,
  BookOpen,
  X,
  Edit,
  Save,
  XCircle,
} from "lucide-react";
import { base } from "../helper";
import Breadcrumb from "../components/Breadcrumb";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    profilePhoto: null,
    oldPassword: "",
    newPassword: "",
  });
  const [activeTab, setActiveTab] = useState("bookings");
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  // booking edit state
  const [editBookingId, setEditBookingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  // admin quick tools state
  const [adminStats, setAdminStats] = useState(null);
  const [adminUserId, setAdminUserId] = useState("");
  const [adminVenueId, setAdminVenueId] = useState("");
  const [adminReason, setAdminReason] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");

  const API_BASE = base;

  useEffect(() => {
    fetchUserData();
    fetchBookings();
  }, []);

  // fetch admin stats if current user is admin
  useEffect(() => {
    const isAdmin = formData.role === "admin";
    if (!isAdmin) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/stats/admin`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const js = await res.json();
          setAdminStats(js?.data || null);
        }
      } catch {}
    };
    fetchStats();
  }, [formData.role]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE}/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.user) {
        const user = data.user;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "user",
          profilePhoto: user.profilePhoto || null,
          oldPassword: "",
          newPassword: "",
        });

        // Store user data in localStorage for consistency with original code
        localStorage.setItem(
          "qc_user",
          JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilePhoto: user.profilePhoto,
          })
        );
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      setBookingsError("");
      const response = await fetch(`${API_BASE}/bookings/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const bookingsData = Array.isArray(data) ? data : data.bookings || [];
      setBookings(bookingsData);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setBookingsError("Failed to load bookings. Please try again.");
    } finally {
      setLoadingBookings(false);
    }
  };

  const openEditBooking = (b) => {
    setEditBookingId(b._id);
    // Pre-fill
    try {
      const iso = new Date(b.date).toISOString().slice(0, 10);
      setEditDate(iso);
    } catch {
      setEditDate("");
    }
    setEditStart(b?.timeSlot?.start || "");
    setEditEnd(b?.timeSlot?.end || "");
    setEditMsg("");
  };

  const cancelEditBooking = () => {
    setEditBookingId(null);
    setEditDate("");
    setEditStart("");
    setEditEnd("");
    setEditBusy(false);
    setEditMsg("");
  };

  const saveEditBooking = async (id) => {
    try {
      if (!editDate || !editStart || !editEnd) {
        setEditMsg("Please select date, start time and end time");
        return;
      }
      if (editStart >= editEnd) {
        setEditMsg("End time must be after start time");
        return;
      }
      setEditBusy(true);
      setEditMsg("");
      const response = await fetch(`${API_BASE}/bookings/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          timeSlot: { start: editStart, end: editEnd },
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      await fetchBookings();
      cancelEditBooking();
    } catch (err) {
      setEditMsg(err.message || "Failed to update booking");
    } finally {
      setEditBusy(false);
    }
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      oldPassword: "",
      newPassword: "",
    });
    setSaveMsg("");
    setSelectedFile(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMsg("");

      const isPasswordChange =
        formData.newPassword && formData.newPassword.trim().length > 0;
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);

      if (isPasswordChange) {
        formDataToSend.append("password", formData.newPassword.trim());
        formDataToSend.append(
          "oldPassword",
          (formData.oldPassword || "").trim()
        );
      }

      if (selectedFile) {
        formDataToSend.append("profilePhoto", selectedFile);
      }

      const response = await fetch(`${API_BASE}/users/me/update`, {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to update profile"
        );
      }

      const data = await response.json();
      const updatedUser = data.user || data;

      if (updatedUser) {
        // Update localStorage
        localStorage.setItem(
          "qc_user",
          JSON.stringify({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            profilePhoto: updatedUser.profilePhoto,
          })
        );

        // Update form data
        setFormData((prev) => ({
          ...prev,
          name: updatedUser.name || prev.name,
          email: updatedUser.email || prev.email,
          phone: updatedUser.phone || prev.phone,
          profilePhoto: updatedUser.profilePhoto || prev.profilePhoto,
          oldPassword: "",
          newPassword: "",
        }));

        setSelectedFile(null);
        setSaveMsg("Profile updated successfully!");
        setShowEdit(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setSaveMsg(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getRoleInfo = (role) => {
    const roles = {
      admin: {
        label: "Admin",
        icon: Shield,
        color: "text-red-400 bg-red-400/20",
        border: "border-red-400/30",
      },
      premium: {
        label: "Premium",
        icon: Star,
        color: "text-yellow-400 bg-yellow-400/20",
        border: "border-yellow-400/30",
      },
      user: {
        label: "User",
        icon: User,
        color: "text-blue-400 bg-blue-400/20",
        border: "border-blue-400/30",
      },
    };
    return roles[role] || roles.user;
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "text-green-400 bg-green-400/20 border-green-400/30",
      completed: "text-blue-400 bg-blue-400/20 border-blue-400/30",
      cancelled: "text-red-400 bg-red-400/20 border-red-400/30",
      pending: "text-yellow-400 bg-yellow-400/20 border-yellow-400/30",
    };
    return colors[status] || colors.pending;
  };

  const nonCancelled = bookings.filter((b) => b.status !== "cancelled");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const roleInfo = getRoleInfo(formData.role);
  const RoleIcon = roleInfo.icon;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb />

          <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            {/* Profile Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-1">
                      <img
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : formData.profilePhoto ||
                              `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`
                        }
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-purple-500 rounded-full p-2 border-4 border-white/20">
                      <RoleIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-white mb-2">
                    {formData.name || "User"}
                  </h1>

                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${roleInfo.color} ${roleInfo.border} text-sm font-medium mb-4`}
                  >
                    <RoleIcon className="w-4 h-4" />
                    {roleInfo.label}
                  </div>

                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">{formData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowEdit(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("bookings");
                      setShowEdit(false);
                      fetchBookings();
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === "bookings" && !showEdit
                        ? "bg-white/20 text-white shadow-lg"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    View Bookings
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {nonCancelled.length}
                    </div>
                    <div className="text-xs text-gray-400">Active Bookings</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {bookings.filter((b) => b.status === "completed").length}
                    </div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                </div>

                {formData.role === "admin" && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-white/10 rounded-2xl border border-white/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-white font-semibold">
                          Admin Tools
                        </div>
                        <button
                          onClick={() =>
                            (window.location.href = "/admin/dashboard")
                          }
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs hover:from-purple-600 hover:to-pink-600"
                        >
                          Open Dashboard
                        </button>
                      </div>
                      {adminStats && (
                        <div className="grid grid-cols-3 gap-3 text-center mb-3">
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-white text-lg font-bold">
                              {adminStats?.users?.total || 0}
                            </div>
                            <div className="text-[11px] text-gray-300">
                              Users
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-white text-lg font-bold">
                              {adminStats?.venues?.pending || 0}
                            </div>
                            <div className="text-[11px] text-gray-300">
                              Pending Venues
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-white text-lg font-bold">
                              {adminStats?.bookings?.total || 0}
                            </div>
                            <div className="text-[11px] text-gray-300">
                              Bookings
                            </div>
                          </div>
                        </div>
                      )}
                      {adminMsg && (
                        <div className="mb-2 text-xs text-emerald-300">
                          {adminMsg}
                        </div>
                      )}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">
                            Quick User Ban/Unban
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={adminUserId}
                              onChange={(e) => setAdminUserId(e.target.value)}
                              placeholder="Enter User ID"
                              className="flex-1 rounded-lg bg-white/5 border border-white/20 px-3 py-2 text-white text-xs"
                            />
                            <button
                              disabled={adminBusy || !adminUserId}
                              onClick={async () => {
                                try {
                                  setAdminBusy(true);
                                  setAdminMsg("");
                                  const res = await fetch(
                                    `${API_BASE}/users/${adminUserId}/toggle-ban`,
                                    {
                                      method: "POST",
                                      credentials: "include",
                                    }
                                  );
                                  if (!res.ok) throw new Error("Action failed");
                                  setAdminMsg("User status toggled");
                                  setAdminUserId("");
                                } catch (e) {
                                  setAdminMsg("Failed to toggle user status");
                                } finally {
                                  setAdminBusy(false);
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs disabled:opacity-50"
                            >
                              Ban/Unban
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-300 mb-1">
                            Quick Venue Approve/Reject
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              value={adminVenueId}
                              onChange={(e) => setAdminVenueId(e.target.value)}
                              placeholder="Enter Venue ID"
                              className="flex-1 rounded-lg bg-white/5 border border-white/20 px-3 py-2 text-white text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              disabled={adminBusy || !adminVenueId}
                              onClick={async () => {
                                try {
                                  setAdminBusy(true);
                                  setAdminMsg("");
                                  const res = await fetch(
                                    `${API_BASE}/venues/${adminVenueId}/approve`,
                                    {
                                      method: "POST",
                                      credentials: "include",
                                    }
                                  );
                                  if (!res.ok)
                                    throw new Error("Approve failed");
                                  setAdminMsg("Venue approved");
                                  setAdminVenueId("");
                                } catch (e) {
                                  setAdminMsg("Failed to approve venue");
                                } finally {
                                  setAdminBusy(false);
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={adminBusy || !adminVenueId}
                              onClick={async () => {
                                try {
                                  setAdminBusy(true);
                                  setAdminMsg("");
                                  const res = await fetch(
                                    `${API_BASE}/venues/${adminVenueId}/reject`,
                                    {
                                      method: "POST",
                                      credentials: "include",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        reason:
                                          adminReason || "Insufficient details",
                                      }),
                                    }
                                  );
                                  if (!res.ok) throw new Error("Reject failed");
                                  setAdminMsg("Venue rejected");
                                  setAdminVenueId("");
                                  setAdminReason("");
                                } catch (e) {
                                  setAdminMsg("Failed to reject venue");
                                } finally {
                                  setAdminBusy(false);
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                          <input
                            value={adminReason}
                            onChange={(e) => setAdminReason(e.target.value)}
                            placeholder="Optional rejection reason"
                            className="mt-2 w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-white/10">
                  <div className="flex">
                    <button
                      onClick={() => {
                        setActiveTab("bookings");
                        setShowEdit(false);
                      }}
                      className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 relative ${
                        activeTab === "bookings" && !showEdit
                          ? "text-white bg-white/10"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      All Bookings ({nonCancelled.length})
                      {activeTab === "bookings" && !showEdit && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("cancelled");
                        setShowEdit(false);
                      }}
                      className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 relative ${
                        activeTab === "cancelled" && !showEdit
                          ? "text-white bg-white/10"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Cancelled ({cancelled.length})
                      {activeTab === "cancelled" && !showEdit && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-pink-400"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setShowEdit(true)}
                      className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 relative ${
                        showEdit
                          ? "text-white bg-white/10"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Edit Profile
                      {showEdit && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                  {saveMsg && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-center animate-pulse">
                      {saveMsg}
                    </div>
                  )}

                  {/* All Bookings Tab */}
                  {!showEdit && activeTab === "bookings" && (
                    <div className="space-y-4">
                      {loadingBookings ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                          <span className="ml-3 text-gray-300">
                            Loading bookings...
                          </span>
                        </div>
                      ) : bookingsError ? (
                        <div className="text-center py-12 text-red-400">
                          {bookingsError}
                        </div>
                      ) : nonCancelled.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No bookings yet</p>
                          <p className="text-sm">
                            Your future bookings will appear here
                          </p>
                        </div>
                      ) : (
                        nonCancelled.map((booking) => {
                          const isEditing = editBookingId === booking._id;
                          return (
                            <div
                              key={booking._id}
                              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:shadow-lg"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-purple-500/20 rounded-lg p-2">
                                    <MapPin className="w-5 h-5 text-purple-400" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-white text-lg">
                                      {booking.venue?.name || booking.court}
                                    </h3>
                                    {booking.venue?.address && (
                                      <p className="text-gray-400 text-sm">
                                        {booking.venue.address}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </span>
                              </div>

                              {!isEditing ? (
                                <>
                                  <div className="flex items-center gap-6 text-gray-300">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-purple-400" />
                                      <span className="text-sm">
                                        {formatDate(booking.date)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-purple-400" />
                                      <span className="text-sm">
                                        {booking.timeSlot?.start} -{" "}
                                        {booking.timeSlot?.end}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-4 flex items-center gap-2">
                                    <button
                                      onClick={() => openEditBooking(booking)}
                                      className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
                                    >
                                      <Edit className="w-4 h-4" /> Edit
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="mt-3 space-y-3">
                                  {editMsg && (
                                    <div className="text-red-400 text-sm">
                                      {editMsg}
                                    </div>
                                  )}
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-300 mb-1">
                                        Date
                                      </label>
                                      <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) =>
                                          setEditDate(e.target.value)
                                        }
                                        className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-300 mb-1">
                                        Start
                                      </label>
                                      <input
                                        type="time"
                                        value={editStart}
                                        onChange={(e) =>
                                          setEditStart(e.target.value)
                                        }
                                        className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-300 mb-1">
                                        End
                                      </label>
                                      <input
                                        type="time"
                                        value={editEnd}
                                        onChange={(e) =>
                                          setEditEnd(e.target.value)
                                        }
                                        className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-white"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      disabled={editBusy}
                                      onClick={() =>
                                        saveEditBooking(booking._id)
                                      }
                                      className="inline-flex items-center gap-2 rounded-md bg-purple-500 hover:bg-purple-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                                    >
                                      <Save className="w-4 h-4" /> Save
                                    </button>
                                    <button
                                      onClick={cancelEditBooking}
                                      className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
                                    >
                                      <XCircle className="w-4 h-4" /> Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Cancelled Bookings Tab */}
                  {!showEdit && activeTab === "cancelled" && (
                    <div className="space-y-4">
                      {cancelled.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <X className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No cancelled bookings</p>
                        </div>
                      ) : (
                        cancelled.map((booking) => (
                          <div
                            key={booking._id}
                            className="bg-red-500/5 rounded-xl p-6 border border-red-500/20 opacity-75"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-red-500/20 rounded-lg p-2">
                                  <MapPin className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white text-lg">
                                    {booking.venue?.name || booking.court}
                                  </h3>
                                  {booking.venue?.address && (
                                    <p className="text-gray-400 text-sm">
                                      {booking.venue.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-medium text-red-400 bg-red-400/20 border border-red-400/30">
                                Cancelled
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">
                                  {formatDate(booking.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">
                                  {booking.timeSlot?.start} -{" "}
                                  {booking.timeSlot?.end}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Edit Profile Form */}
                  {showEdit && (
                    <div className="max-w-2xl mx-auto">
                      <div className="space-y-6">
                        {/* Profile Photo Section */}
                        <div className="text-center">
                          <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-1">
                              <img
                                src={
                                  selectedFile
                                    ? URL.createObjectURL(selectedFile)
                                    : formData.profilePhoto ||
                                      `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`
                                }
                                alt="Profile Preview"
                                className="w-full h-full rounded-full object-cover bg-white"
                              />
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-purple-500 hover:bg-purple-600 rounded-full p-2 border-4 border-white/20 cursor-pointer transition-colors duration-200">
                              <Camera className="w-4 h-4 text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  setSelectedFile(e.target.files?.[0] || null)
                                }
                              />
                            </label>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Click the camera icon to change your photo
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                              placeholder="Enter your full name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              readOnly
                              disabled
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-400 cursor-not-allowed"
                              title="Email cannot be changed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                              placeholder="Enter your phone number"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Account Role
                            </label>
                            <div
                              className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${roleInfo.color} ${roleInfo.border}`}
                            >
                              <RoleIcon className="w-4 h-4" />
                              <span className="font-medium">
                                {roleInfo.label}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              name="oldPassword"
                              value={formData.oldPassword}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                              placeholder="Required to change password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                              placeholder="Enter new password"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                          <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 border border-white/20"
                          >
                            Reset Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                              saving
                                ? "bg-purple-500/60 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25"
                            }`}
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
