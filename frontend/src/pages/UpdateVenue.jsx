import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { base } from "../helper";
import Breadcrumb from "../components/Breadcrumb";

const UpdateVenue = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sports, setSports] = useState([]);
  const [venue, setVenue] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    googleMapLink: "",
    venueType: "indoor",
    isActive: true,
    amenities: [],
    courts: [],
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
      customDays: [],
    },
  });

  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [replacePhotos, setReplacePhotos] = useState(false);

  const amenitiesOptions = [
    "parking",
    "restrooms",
    "wifi",
    "cafeteria",
    "locker_room",
    "showers",
    "equipment_rental",
    "lighting",
    "first_aid",
  ];

  const venueTypeOptions = ["indoor", "outdoor", "all"];


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSportChange = (sportId) => {
    setFormData((prev) => {
      const newSports = prev.sports.includes(sportId)
        ? prev.sports.filter((s) => s !== sportId)
        : [...prev.sports, sportId];

      const sport = sports.find((s) => s._id === sportId);
      let newCourts = [...prev.courts];

      if (newSports.includes(sportId)) {
        // Sport was added - add a new court if it doesn't exist
        const courtExists = newCourts.some(
          (court) => court.sportId === sportId
        );

        if (!courtExists && sport) {
          newCourts.push({
            name: sport.name,
            sportId: sportId, // FIXED: Always include sportId
            perHourPrice: 0,
          });
        }
      } else {
        // Sport was removed - remove the corresponding court
        newCourts = newCourts.filter((court) => court.sportId !== sportId);
      }

      return {
        ...prev,
        sports: newSports,
        courts: newCourts,
      };
    });
  };

  const handleCourtChange = (index, field, value) => {
    const updatedCourts = [...formData.courts];
    updatedCourts[index] = {
      ...updatedCourts[index],
      [field]: field === "perHourPrice" ? Number(value) : value,
    };
    setFormData((prev) => ({ ...prev, courts: updatedCourts }));
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const addCustomDay = () => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        customDays: [
          ...(prev.openingHours.customDays || []),
          {
            id: Date.now() + Math.random(),
            day: "monday",
            open: "",
            close: "",
          },
        ],
      },
    }));
  };

  const updateCustomDay = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        customDays: (prev.openingHours.customDays || []).map((day, i) =>
          i === index ? { ...day, [field]: value } : day
        ),
      },
    }));
  };

  const removeCustomDay = (index) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        customDays: (prev.openingHours.customDays || []).filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos(files);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("googleMapLink", formData.googleMapLink);
      formDataToSend.append("venueType", formData.venueType);
      formDataToSend.append("isActive", formData.isActive);

      // Add arrays as JSON strings
      formDataToSend.append("amenities", JSON.stringify(formData.amenities));
      formDataToSend.append("sports", JSON.stringify(formData.sports));

      // Format courts properly - ensure sportId is included
      const formattedCourts = formData.courts.map((court) => ({
        name: court.name,
        perHourPrice: Number(court.perHourPrice) || 0,
        sportId: court.sportId,
      }));
      formDataToSend.append("courts", JSON.stringify(formattedCourts));

      // FIXED: Send openingHours as JSON string instead of form fields
      // This prevents the casting error by keeping the structure intact
      formDataToSend.append(
        "openingHours",
        JSON.stringify(formData.openingHours)
      );

      // Add photos
      if (newPhotos.length > 0) {
        newPhotos.forEach((photo) => {
          formDataToSend.append("photos", photo); // Changed from 'photos' array to individual files
        });
        formDataToSend.append("replacePhotos", replacePhotos);
      }

      const response = await axios.put(
        `${base}/venues/${venueId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setSuccess("Venue updated successfully!");
      setVenue(response.data);

      // Update photos state
      if (replacePhotos && newPhotos.length > 0) {
        // If replacing photos, get URLs from response instead of creating object URLs
        setPhotos(response.data.photos || []);
      } else if (newPhotos.length > 0) {
        // If appending photos, get updated photos from response
        setPhotos(response.data.photos || []);
      }

      setNewPhotos([]);
      setReplacePhotos(false);

      setTimeout(() => {
        navigate(`/venues/${venueId}`);
      }, 2000);
    } catch (err) {
      console.error("Update venue error:", err);
      setError(err.response?.data?.error || "Failed to update venue");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [venueResponse, sportsResponse] = await Promise.all([
          axios.get(`${base}/venues/${venueId}`),
          axios.get(`${base}/sports`)
        ]);
  
        const venueData = venueResponse.data;
        setVenue(venueData);
        setSports(sportsResponse.data);
  
        // FIXED: Set form data with proper court mapping
        setFormData({
          name: venueData.name || "",
          description: venueData.description || "",
          address: venueData.address || "",
          googleMapLink: venueData.googleMapLink || "",
          venueType: venueData.venueType || "indoor",
          isActive: venueData.isActive !== undefined ? venueData.isActive : true,
          amenities: Array.isArray(venueData.amenities) ? venueData.amenities : [],
          courts: Array.isArray(venueData.courts) ? venueData.courts.map(court => {
            // FIXED: Find sportId from venue's sports array
            const relatedSport = venueData.sports?.find(s => s.name === court.name);
            return {
              name: court.name,
              perHourPrice: Number(court.perHourPrice) || 0,
              sportId: court.sportId || relatedSport?._id || null
            };
          }) : [],
          sports: Array.isArray(venueData.sports) ? venueData.sports.map(s => s._id) : [],
          openingHours: {
            monday: venueData.openingHours?.monday || { open: "", close: "" },
            tuesday: venueData.openingHours?.tuesday || { open: "", close: "" },
            wednesday: venueData.openingHours?.wednesday || { open: "", close: "" },
            thursday: venueData.openingHours?.thursday || { open: "", close: "" },
            friday: venueData.openingHours?.friday || { open: "", close: "" },
            saturday: venueData.openingHours?.saturday || { open: "", close: "" },
            sunday: venueData.openingHours?.sunday || { open: "", close: "" },
            _24hours: venueData.openingHours?._24hours || false,
            customDays: Array.isArray(venueData.openingHours?.customDays) 
              ? venueData.openingHours.customDays.map(customDay => ({
                  id: customDay.id || Date.now() + Math.random(),
                  day: customDay.day || "monday",
                  open: customDay.open || "",
                  close: customDay.close || ""
                }))
              : [],
          },
        });
  
        setPhotos(Array.isArray(venueData.photos) ? venueData.photos : []);
      } catch (err) {
        setError("Failed to load venue data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [venueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Venue not found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb />

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Update Venue
          </h1>
          <p className="text-lg text-gray-600">
            Modify your venue information and settings
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Basic Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Venue Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Enter venue name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Venue Type *
                </label>
                <select
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  {venueTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Describe your venue, facilities, and what makes it special..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Enter complete venue address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Google Maps Link *
                </label>
                <input
                  type="url"
                  name="googleMapLink"
                  value={formData.googleMapLink}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Availability</h2>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all duration-200"
              />
              <label className="ml-3 text-lg text-gray-900 font-medium">
                Venue is active and accepting bookings
              </label>
            </div>
          </div>

          {/* Sports */}
          <div
            id="sports-section"
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Supported Sports
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sports.map((sport) => (
                <div
                  key={sport._id}
                  className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    id={sport._id}
                    checked={formData.sports.includes(sport._id)}
                    onChange={() => handleSportChange(sport._id)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-all duration-200"
                  />
                  <label
                    htmlFor={sport._id}
                    className="ml-3 text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    {sport.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> Selecting sports will automatically
                create courts in the "Courts & Pricing" section below. You can
                then set the hourly price for each court.
              </p>
            </div>
            {formData.sports.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Please select at least one sport to enable courts and
                  pricing configuration.
                </p>
              </div>
            )}
          </div>

          {/* Courts & Pricing - Only show if sports are selected */}
          {formData.sports.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-100 rounded-xl mr-4">
                    <svg
                      className="w-6 h-6 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Courts & Pricing
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Courts are automatically created based on selected sports
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {formData.courts.map((court, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Court: {court.name}
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                          This court is automatically created for {court.name}{" "}
                          sport
                        </p>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price per Hour (₹)
                        </label>
                        <input
                          type="number"
                          value={court.perHourPrice}
                          onChange={(e) =>
                            handleCourtChange(
                              index,
                              "perHourPrice",
                              e.target.value
                            )
                          }
                          min="0"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.courts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <p className="text-lg font-medium">No courts available</p>
                    <p className="text-sm">
                      Select sports from the "Supported Sports" section above to
                      automatically create courts
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById("sports-section")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Go to Supported Sports
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Opening Hours */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-orange-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Opening Hours
              </h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.openingHours._24hours}
                  onChange={(e) =>
                    handleOpeningHoursChange(
                      "_24hours",
                      "_24hours",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-200"
                />
                <label className="ml-3 text-lg text-gray-900 font-medium">
                  Open 24 hours
                </label>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Note:</strong> The 24 hours option indicates if
                  your venue operates around the clock. You can still set
                  specific opening hours for individual days below, which will
                  override the 24 hours setting for those specific days.
                </p>
              </div>

              {/* Standard Days */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Standard Opening Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(formData.openingHours)
                    .filter((day) => day !== "_24hours" && day !== "customDays")
                    .map((day) => (
                      <div
                        key={day}
                        className="border border-gray-200 rounded-xl p-6 bg-gray-50"
                      >
                        <h3 className="font-bold text-gray-900 mb-4 capitalize text-lg">
                          {day}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Open
                            </label>
                            <input
                              type="time"
                              value={formData.openingHours[day].open}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day,
                                  "open",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Close
                            </label>
                            <input
                              type="time"
                              value={formData.openingHours[day].close}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day,
                                  "close",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Custom Days Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Custom Days
                  </h3>
                  <button
                    type="button"
                    onClick={addCustomDay}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Custom Day
                  </button>
                </div>

                {formData.openingHours.customDays &&
                  formData.openingHours.customDays.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.openingHours.customDays.map(
                        (customDay, index) => (
                          <div
                            key={customDay.id}
                            className="border border-orange-200 rounded-xl p-6 bg-orange-50"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-gray-900 text-lg">
                                Custom Day {index + 1}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeCustomDay(index)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Day of Week
                                </label>
                                <select
                                  value={customDay.day}
                                  onChange={(e) =>
                                    updateCustomDay(
                                      index,
                                      "day",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                                >
                                  <option value="monday">Monday</option>
                                  <option value="tuesday">Tuesday</option>
                                  <option value="wednesday">Wednesday</option>
                                  <option value="thursday">Thursday</option>
                                  <option value="friday">Friday</option>
                                  <option value="saturday">Saturday</option>
                                  <option value="sunday">Sunday</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Open
                                  </label>
                                  <input
                                    type="time"
                                    value={customDay.open}
                                    onChange={(e) =>
                                      updateCustomDay(
                                        index,
                                        "open",
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-xl border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Close
                                  </label>
                                  <input
                                    type="time"
                                    value={customDay.close}
                                    onChange={(e) =>
                                      updateCustomDay(
                                        index,
                                        "close",
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-xl border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {(!formData.openingHours.customDays ||
                  formData.openingHours.customDays.length === 0) && (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm">No custom days added yet</p>
                    <p className="text-xs text-gray-400">
                      Click "Add Custom Day" to set different opening hours for
                      specific days
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Amenities</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesOptions.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
                  />
                  <label
                    htmlFor={amenity}
                    className="ml-3 text-sm font-medium text-gray-900 cursor-pointer capitalize"
                  >
                    {amenity.replace("_", " ")}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-pink-100 rounded-xl mr-4">
                <svg
                  className="w-6 h-6 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
            </div>

            {/* Current Photos */}
            {photos.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Current Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Venue ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl border-2 border-gray-200 group-hover:border-red-400 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-700 shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Photos */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Add New Photos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all duration-200">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Click to upload photos
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </label>
                </div>
              </div>

              {newPhotos.length > 0 && (
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={replacePhotos}
                      onChange={(e) => setReplacePhotos(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-900">
                      Replace all existing photos
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {newPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(photo)}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl border-2 border-blue-300"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-6 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                "Update Venue"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/venues/${venueId}`)}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateVenue;
