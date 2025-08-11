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

        // Set form data
        setFormData({
          name: venueData.name || "",
          description: venueData.description || "",
          address: venueData.address || "",
          googleMapLink: venueData.googleMapLink || "",
          venueType: venueData.venueType || "indoor",
          isActive: venueData.isActive !== undefined ? venueData.isActive : true,
          amenities: venueData.amenities || [],
          courts: venueData.courts || [],
          sports: venueData.sports?.map(s => s._id) || [],
          openingHours: venueData.openingHours || {
            monday: { open: "", close: "" },
            tuesday: { open: "", close: "" },
            wednesday: { open: "", close: "" },
            thursday: { open: "", close: "" },
            friday: { open: "", close: "" },
            saturday: { open: "", close: "" },
            sunday: { open: "", close: "" },
            _24hours: false,
          },
        });

        setPhotos(venueData.photos || []);
      } catch (err) {
        setError("Failed to load venue data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSportChange = (sportId) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(s => s !== sportId)
        : [...prev.sports, sportId]
    }));
  };

  const handleCourtChange = (index, field, value) => {
    const updatedCourts = [...formData.courts];
    updatedCourts[index] = {
      ...updatedCourts[index],
      [field]: field === 'perHourPrice' ? Number(value) : value
    };
    setFormData(prev => ({ ...prev, courts: updatedCourts }));
  };

  const addCourt = () => {
    setFormData(prev => ({
      ...prev,
      courts: [...prev.courts, { name: "", perHourPrice: 0 }]
    }));
  };

  const removeCourt = (index) => {
    setFormData(prev => ({
      ...prev,
      courts: prev.courts.filter((_, i) => i !== index)
    }));
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos(files);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();

      // Add basic fields
      Object.keys(formData).forEach(key => {
        if (key === 'courts' || key === 'amenities' || key === 'sports') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'openingHours') {
          // Handle opening hours
          Object.keys(formData.openingHours).forEach(day => {
            if (day === '_24hours') {
              formDataToSend.append(`openingHours[${day}]`, formData.openingHours[day]);
            } else {
              const dayHours = formData.openingHours[day];
              if (dayHours.open) {
                formDataToSend.append(`openingHours[${day}][open]`, dayHours.open);
              }
              if (dayHours.close) {
                formDataToSend.append(`openingHours[${day}][close]`, dayHours.close);
              }
            }
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add photos
      if (newPhotos.length > 0) {
        newPhotos.forEach(photo => {
          formDataToSend.append('photos', photo);
        });
        formDataToSend.append('replacePhotos', replacePhotos);
      }

      const response = await axios.put(
        `${base}/venues/${venueId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      setSuccess("Venue updated successfully!");
      setVenue(response.data);
      
      // Update photos if replaced
      if (replacePhotos && newPhotos.length > 0) {
        setPhotos(newPhotos.map(file => URL.createObjectURL(file)));
      } else if (newPhotos.length > 0) {
        setPhotos(prev => [...prev, ...newPhotos.map(file => URL.createObjectURL(file))]);
      }
      
      setNewPhotos([]);
      setReplacePhotos(false);

      setTimeout(() => {
        navigate(`/venues/${venueId}`);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to update venue");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Venue not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb />
        <h1 className="text-3xl font-bold mb-6">Update Venue</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Type *
                </label>
                <select
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {venueTypeOptions.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Link *
                </label>
                <input
                  type="url"
                  name="googleMapLink"
                  value={formData.googleMapLink}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Availability</h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Venue is active and accepting bookings
              </label>
            </div>
          </div>

          {/* Sports */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Supported Sports</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sports.map(sport => (
                <div key={sport._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={sport._id}
                    checked={formData.sports.includes(sport._id)}
                    onChange={() => handleSportChange(sport._id)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor={sport._id} className="ml-2 block text-sm text-gray-900">
                    {sport.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Courts & Pricing */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Courts & Pricing</h2>
              <button
                type="button"
                onClick={addCourt}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
              >
                Add Court
              </button>
            </div>
            <div className="space-y-4">
              {formData.courts.map((court, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Court Name
                    </label>
                    <input
                      type="text"
                      value={court.name}
                      onChange={(e) => handleCourtChange(index, 'name', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Hour (₹)
                    </label>
                    <input
                      type="number"
                      value={court.perHourPrice}
                      onChange={(e) => handleCourtChange(index, 'perHourPrice', e.target.value)}
                      min="0"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCourt(index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Opening Hours</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.openingHours._24hours}
                  onChange={(e) => handleOpeningHoursChange('_24hours', '_24hours', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Open 24 hours
                </label>
              </div>

              {!formData.openingHours._24hours && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(formData.openingHours).filter(day => day !== '_24hours').map(day => (
                    <div key={day} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2 capitalize">{day}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Open</label>
                          <input
                            type="time"
                            value={formData.openingHours[day].open}
                            onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Close</label>
                          <input
                            type="time"
                            value={formData.openingHours[day].close}
                            onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenitiesOptions.map(amenity => (
                <div key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor={amenity} className="ml-2 block text-sm text-gray-900 capitalize">
                    {amenity.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            
            {/* Current Photos */}
            {photos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Current Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Venue ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Photos */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Photos
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {newPhotos.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={replacePhotos}
                      onChange={(e) => setReplacePhotos(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Replace all existing photos
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(photo)}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Updating..." : "Update Venue"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/venues/${venueId}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
