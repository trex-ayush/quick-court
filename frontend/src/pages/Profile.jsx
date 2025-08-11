import React, { useEffect, useState } from "react";
import axios from "axios";
import { base } from "../helper";
import profileImage from "../assets/login.jpg"; // Fallback avatar

const mockBookings = [
  {
    id: 1,
    venue: "Skyline Badminton Court (Badminton)",
    date: "18 June 2025",
    time: "5:00 PM - 6:00 PM",
    location: "Rajkot, Gujarat",
    status: "Confirmed",
    isPast: false,
    cancelled: false,
  },
  {
    id: 2,
    venue: "Skyline Badminton Court (Badminton)",
    date: "18 June 2024",
    time: "5:00 PM - 6:00 PM",
    location: "Rajkot, Gujarat",
    status: "Confirmed",
    isPast: true,
    cancelled: false,
  },
  {
    id: 3,
    venue: "Skyline Badminton Court (Badminton)",
    date: "10 May 2024",
    time: "4:00 PM - 5:00 PM",
    location: "Rajkot, Gujarat",
    status: "Cancelled",
    isPast: true,
    cancelled: true,
  },
];

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profilePhoto: null,
    oldPassword: "",
    newPassword: "",
  });
  const [activeTab, setActiveTab] = useState("bookings");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    // Load from localStorage first for an instant render
    const stored = localStorage.getItem("qc_user");
    if (stored) {
      const u = JSON.parse(stored);
      setFormData((prev) => ({
        ...prev,
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        profilePhoto: u.profilePhoto || u.avatar || null,
      }));
    }

    // Validate/fetch from backend if cookie exists
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${base}/users/me`, { withCredentials: true });
        const u = res.data?.user;
        if (u) {
          setFormData((prev) => ({
            ...prev,
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            profilePhoto: u.profilePhoto || null,
          }));
          localStorage.setItem(
            "qc_user",
            JSON.stringify({
              id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              role: u.role,
              profilePhoto: u.profilePhoto || null,
            })
          );
        }
      } catch (err) {
        // Not logged in or server error; ignore to keep UI usable
      }
    };

    fetchMe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      oldPassword: "",
      newPassword: "",
    });
  };

  const handleSave = () => {
    alert("Profile Updated!");
    setShowEdit(false);
  };

  const filteredBookings = (cancelled) =>
    mockBookings.filter((b) => b.cancelled === cancelled);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-r from-blue-900 via-purple-900 to-black">
      <div className="flex min-h-screen w-full flex-col md:flex-row bg-black/40 text-white">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col items-center">
          <img
            src={formData.profilePhoto || profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-purple-500"
          />
          <h2 className="text-lg font-semibold">{formData.name || "User"}</h2>
          <p className="text-gray-400">{formData.phone || ""}</p>
          <p className="text-gray-400 mb-4">{formData.email || ""}</p>

          <button
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md mb-2"
            onClick={() => setShowEdit(true)}
          >
            Edit Profile
          </button>
          <button
            className={`w-full ${activeTab === "bookings" ? "bg-green-900" : "bg-gray-700"} hover:bg-green-800 text-white py-2 rounded-md`}
            onClick={() => {
              setActiveTab("bookings");
              setShowEdit(false);
            }}
          >
            All Bookings
          </button>
        </div>

        {/* Main Content: Tabs */}
        <div className="w-full md:w-2/3 p-6 flex flex-col">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              className={`px-4 py-2 rounded-t-md font-semibold border-b-2 ${
                activeTab === "bookings" && !showEdit
                  ? "border-green-500 text-green-400 bg-black/30"
                  : "border-transparent text-gray-400 bg-black/10"
              }`}
              onClick={() => {
                setActiveTab("bookings");
                setShowEdit(false);
              }}
            >
              All Bookings
            </button>
            <button
              className={`px-4 py-2 rounded-t-md font-semibold border-b-2 ${
                activeTab === "cancelled" && !showEdit
                  ? "border-red-500 text-red-400 bg-black/30"
                  : "border-transparent text-gray-400 bg-black/10"
              }`}
              onClick={() => {
                setActiveTab("cancelled");
                setShowEdit(false);
              }}
            >
              Cancelled
            </button>
            <button
              className={`ml-auto px-4 py-2 rounded-t-md font-semibold border-b-2 ${
                showEdit
                  ? "border-purple-500 text-purple-400 bg-black/30"
                  : "border-transparent text-gray-400 bg-black/10"
              }`}
              onClick={() => setShowEdit(true)}
            >
              Edit Profile
            </button>
          </div>

          {/* Tab Content */}
          {!showEdit && activeTab === "bookings" && (
            <div className="space-y-4">
              {filteredBookings(false).length === 0 ? (
                <div className="text-gray-400">No bookings found.</div>
              ) : (
                filteredBookings(false).map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-black/60 rounded-lg p-4 border border-gray-700 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <span className="text-blue-400">📍</span>
                      {booking.venue}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span>📅 {booking.date}</span>
                      <span>⏰ {booking.time}</span>
                    </div>
                    <div className="flex gap-2 text-sm text-gray-400">
                      <span>📌 {booking.location}</span>
                      <span>
                        Status: <span className="text-green-400">{booking.status}</span>
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2">
                      {!booking.isPast && (
                        <button className="text-red-400 hover:underline">Cancel Booking</button>
                      )}
                      <button className="text-purple-400 hover:underline">Write Review</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!showEdit && activeTab === "cancelled" && (
            <div className="space-y-4">
              {filteredBookings(true).length === 0 ? (
                <div className="text-gray-400">No cancelled bookings.</div>
              ) : (
                filteredBookings(true).map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-black/60 rounded-lg p-4 border border-gray-700 flex flex-col gap-2 opacity-60"
                  >
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <span className="text-blue-400">📍</span>
                      {booking.venue}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span>📅 {booking.date}</span>
                      <span>⏰ {booking.time}</span>
                    </div>
                    <div className="flex gap-2 text-sm text-gray-400">
                      <span>📌 {booking.location}</span>
                      <span>
                        Status: <span className="text-red-400">{booking.status}</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {showEdit && (
            <div className="max-w-md mx-auto w-full">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Old Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
