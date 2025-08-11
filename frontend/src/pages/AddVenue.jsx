import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { base } from "../helper";
import Breadcrumb from "../components/Breadcrumb";

const AMENITIES = [
  { key: "parking", label: "Parking", icon: "🅿️" },
  { key: "restrooms", label: "Restrooms", icon: "🚻" },
  { key: "wifi", label: "WiFi", icon: "📶" },
  { key: "cafeteria", label: "Cafeteria", icon: "☕" },
  { key: "locker_room", label: "Locker Room", icon: "🏃" },
  { key: "showers", label: "Showers", icon: "🚿" },
  { key: "equipment_rental", label: "Equipment Rental", icon: "⚽" },
  { key: "lighting", label: "Lighting", icon: "💡" },
  { key: "first_aid", label: "First Aid", icon: "🏥" },
];

const DAYS = [
  { key: "monday", label: "Monday", icon: "📅" },
  { key: "tuesday", label: "Tuesday", icon: "📅" },
  { key: "wednesday", label: "Wednesday", icon: "📅" },
  { key: "thursday", label: "Thursday", icon: "📅" },
  { key: "friday", label: "Friday", icon: "📅" },
  { key: "saturday", label: "Saturday", icon: "🌅" },
  { key: "sunday", label: "Sunday", icon: "🌅" },
];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const AddVenue = () => {
  const navigate = useNavigate();
  const [sports, setSports] = useState([]);
  const [sportQuery, setSportQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    googleMapLink: "",
    venueType: "indoor",
    amenities: [],
    sports: [],
    openingHours: {
      monday: { open: "", close: "" },
      tuesday: { open: "", close: "" },
      wednesday: { open: "", close: "" },
      thursday: { open: "", close: "" },
      friday: { open: "", close: "" },
      saturday: { open: "", close: "" },
      sunday: { open: "", close: "" },
      _24hours: false,
    },
    courts: [],
    photos: [],
  });

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const { data } = await axios.get(`${base}/sports/`);
        setSports(Array.isArray(data?.data) ? data.data : data);
      } catch (_) {
        // ignore; dropdown will be empty
      }
    };
    fetchSports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toggleAmenity = (amenity) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const toggleSport = (id) => {
    setForm((f) => {
      const sport = sports.find(s => (s._id || s.id) === id);
      const sportName = sport?.name || `Sport ${id}`;
      
      if (f.sports.includes(id)) {
        // Remove sport and its corresponding court
        return {
          ...f,
          sports: f.sports.filter((s) => s !== id),
          courts: f.courts.filter((c) => c.name !== sportName)
        };
      } else {
        // Add sport and create a corresponding court
        return {
          ...f,
          sports: [...f.sports, id],
          courts: [...f.courts, { name: sportName, perHourPrice: "" }]
        };
      }
    });
  };

  const filteredSports = sports.filter((s) =>
    s?.name?.toLowerCase().includes(sportQuery.toLowerCase())
  );

  const handleCourtChange = (idx, key, value) => {
    setForm((f) => {
      const courts = [...f.courts];
      courts[idx] = { ...courts[idx], [key]: value };
      return { ...f, courts };
    });
  };
  
  const removeCourt = (idx) =>
    setForm((f) => ({ ...f, courts: f.courts.filter((_, i) => i !== idx) }));

  const handlePhotoChange = (e) => {
    setForm((f) => ({ ...f, photos: Array.from(e.target.files || []) }));
  };

  const setDayTime = (day, key, value) => {
    setForm((f) => ({
      ...f,
      openingHours: {
        ...f.openingHours,
        [day]: { ...f.openingHours[day], [key]: value },
      },
    }));
  };

  const toggleClosed = (day) => {
    const isClosed =
      !form.openingHours[day]?.open && !form.openingHours[day]?.close;
    // If currently closed, set a default open-close; else clear both to mark closed
    if (isClosed) {
      setDayTime(day, "open", "08:00");
      setDayTime(day, "close", "22:00");
    } else {
      setDayTime(day, "open", "");
      setDayTime(day, "close", "");
    }
  };

  const copyMondayToAll = () => {
    const src = form.openingHours.monday || { open: "", close: "" };
    setForm((f) => ({
      ...f,
      openingHours: {
        ...f.openingHours,
        tuesday: { ...src },
        wednesday: { ...src },
        thursday: { ...src },
        friday: { ...src },
        saturday: { ...src },
        sunday: { ...src },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("address", form.address);
      fd.append("googleMapLink", form.googleMapLink);
      fd.append("venueType", form.venueType);
      form.amenities.forEach((a) => fd.append("amenities", a));
      form.sports.forEach((s) => fd.append("sports", s));
      // Courts as JSON
      fd.append(
        "courts",
        JSON.stringify(
          form.courts.map((c) => ({
            name: c.name,
            perHourPrice: Number(c.perHourPrice) || 0,
          }))
        )
      );
      // Opening hours (optional)
      if (form.openingHours?._24hours) {
        fd.append("openingHours[_24hours]", "true");
      } else {
        DAYS.forEach(({ key }) => {
          const { open, close } = form.openingHours[key] || {};
          if (open) fd.append(`openingHours[${key}][open]`, open);
          if (close) fd.append(`openingHours[${key}][close]`, close);
        });
      }
      // Photos
      form.photos.forEach((file) => fd.append("photos", file));

      const res = await axios.post(`${base}/venues/createVenue`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        setSuccess("Venue submitted successfully! Pending approval.");
        setTimeout(() => navigate("/venues"), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create venue");
    } finally {
      setLoading(false);
    }
  };

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("qc_user") || "null");
    } catch {
      return null;
    }
  })();
  const canCreate = user && (user.role === "owner" || user.role === "admin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />
        
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            <span className="text-4xl">🏟️</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Add New Sports Venue
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Create an amazing sports venue for the community. Fill in the
            details below to get started.
          </p>
        </div>

        {!canCreate ? (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 text-amber-800 px-6 py-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Access Restricted</h3>
              <p className="text-lg">
                You must be an owner or admin to create a venue.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 shadow-2xl"
          >
            {/* Alert Messages */}
            {error && (
              <div className="rounded-2xl bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <div className="font-semibold">Error</div>
                  <div>{error}</div>
                </div>
              </div>
            )}
            {success && (
              <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200 text-green-700 px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-semibold">Success!</div>
                  <div>{success}</div>
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📝</span> Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Venue Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter venue name..."
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Venue Type *
                  </label>
                  <select
                    name="venueType"
                    value={form.venueType}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="indoor">🏢 Indoor Venue</option>
                    <option value="outdoor">🌤️ Outdoor Venue</option>
                    <option value="all">🌐 All Venue</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your venue, facilities, and what makes it special..."
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📍</span> Location Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Address *
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="Enter complete address..."
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Google Maps Link *
                  </label>
                  <input
                    name="googleMapLink"
                    value={form.googleMapLink}
                    onChange={handleChange}
                    required
                    placeholder="Paste Google Maps URL..."
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sports Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>⚽</span> Supported Sports
              </h2>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={sportQuery}
                    onChange={(e) => setSportQuery(e.target.value)}
                    placeholder="Search sports..."
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    🔎
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSports.map((s) => {
                    const id = s._id || s.id;
                    const checked = form.sports.includes(id);
                    return (
                      <label
                        key={id}
                        className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                          checked
                            ? "border-purple-400 bg-purple-100 text-purple-800 shadow"
                            : "border-slate-200 bg-white hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span>🏆</span>
                          <span className="font-medium">{s.name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSport(id)}
                          className="text-purple-600"
                        />
                      </label>
                    );
                  })}
                </div>
                {filteredSports.length === 0 && (
                  <div className="text-sm text-slate-500">
                    No sports match your search.
                  </div>
                )}
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>🏪</span> Venue Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AMENITIES.map(({ key, label, icon }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm cursor-pointer transition-all duration-200 ${
                      form.amenities.includes(key)
                        ? "border-cyan-400 bg-cyan-100 text-cyan-800 shadow-md transform scale-105"
                        : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(key)}
                      onChange={() => toggleAmenity(key)}
                      className="text-cyan-600 rounded"
                    />
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Opening Hours Section */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span>🕐</span> Opening Hours
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={copyMondayToAll}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-sm font-semibold transition-all"
                  >
                    📋 Copy Monday to All
                  </button>
                  <label className="inline-flex items-center gap-3 text-sm font-semibold bg-white rounded-xl px-4 py-2 border-2 border-orange-200">
                    <input
                      type="checkbox"
                      checked={form.openingHours._24hours}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          openingHours: {
                            ...f.openingHours,
                            _24hours: e.target.checked,
                          },
                        }))
                      }
                      className="text-orange-500 rounded"
                    />
                    <span>🌙</span>
                    <span>24 Hours</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                {DAYS.map(({ key, label }) => {
                  const oh = form.openingHours[key] || { open: "", close: "" };
                  const isClosed = !oh.open && !oh.close;
                  return (
                    <div
                      key={key}
                      className={`grid grid-cols-12 items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        isClosed
                          ? "border-slate-200 bg-slate-50"
                          : "border-orange-200 bg-white shadow-sm"
                      }`}
                    >
                      <div className="col-span-12 sm:col-span-3 text-sm font-bold text-slate-700 flex items-center gap-2">
                        <span>📅</span>
                        {label}
                      </div>
                      <div className="col-span-5 sm:col-span-4">
                        <input
                          type="time"
                          value={oh.open}
                          onChange={(e) =>
                            setDayTime(key, "open", e.target.value)
                          }
                          disabled={form.openingHours._24hours || isClosed}
                          className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-4">
                        <input
                          type="time"
                          value={oh.close}
                          onChange={(e) =>
                            setDayTime(key, "close", e.target.value)
                          }
                          disabled={form.openingHours._24hours || isClosed}
                          className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                      <label className="col-span-12 sm:col-span-1 sm:justify-self-center inline-flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={isClosed}
                          onChange={() => toggleClosed(key)}
                          className="text-red-500 rounded"
                        />
                        <span className="text-red-600">Closed</span>
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 bg-white/60 rounded-xl p-4">
                <p className="text-sm text-slate-600 flex items-start gap-2">
                  <span>💡</span>
                  <span>
                    Leave a day as "Closed" or set open/close times. Enabling 24
                    hours will disable all day inputs.
                  </span>
                </p>
              </div>
            </div>

            {/* Courts Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span>🏟️</span> Courts & Pricing
                </h2>
                <div className="text-sm text-slate-600">
                  Courts are automatically created based on selected sports
                </div>
              </div>
              
              {form.courts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">🏸</div>
                  <p>Select sports above to add courts and set pricing</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.courts.map((c, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-sm"
                    >
                      <div className="sm:col-span-7">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <div className="font-semibold text-slate-800">{c.name}</div>
                            <div className="text-sm text-slate-500">Court name (auto-generated from sport)</div>
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={0}
                            placeholder="Price per hour"
                            value={c.perHourPrice}
                            onChange={(e) =>
                              handleCourtChange(
                                idx,
                                "perHourPrice",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border-2 border-slate-200 pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>
                      {/* <button
                        type="button"
                        onClick={() => removeCourt(idx)}
                        className="sm:col-span-1 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 px-3 py-3 text-red-600 font-bold transition-all duration-200 transform hover:scale-105"
                      >
                        ✕
                      </button> */}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photos Section */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📸</span> Venue Photos
              </h2>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Upload Photos (up to 5)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-violet-500 file:text-white file:font-semibold hover:file:bg-violet-600 file:transition-all border-2 border-dashed border-violet-300 rounded-xl p-4 bg-white"
                  />
                </div>
                {form.photos?.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {form.photos.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="h-24 w-full object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Create Venue</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>↩️</span>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default AddVenue;
