import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { base } from "../helper";
import Breadcrumb from "../components/Breadcrumb";

const apiOrigin = base.replace(/\/api\/?$/, "");
const normalizePhoto = (p) =>
  /^https?:\/\//i.test(p || "")
    ? p
    : `${apiOrigin}/${String(p || "").replaceAll("\\", "/")}`;

const dayKeyToLabel = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const parseDurationMinutes = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
};

// Modal Component
const BookingModal = ({ 
  isOpen, 
  onClose, 
  venue, 
  courts, 
  sports, 
  onConfirmBooking, 
  paying, 
  bookingError, 
  selectedCourtIdx,
  setSelectedCourtIdx,
  selectedDate,
  setSelectedDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  computedPrice,
  checkAvailability,
  availabilityLoading,
  bookedSlots,
  slotConflict,
  checkSlotConflict
}) => {
  if (!isOpen) return null;

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (courts[selectedCourtIdx]) {
      checkAvailability(newDate, courts[selectedCourtIdx]?.name || `Court ${selectedCourtIdx + 1}`);
    }
  };

  const handleCourtChange = (e) => {
    const newCourtIdx = Number(e.target.value);
    setSelectedCourtIdx(newCourtIdx);
    if (selectedDate && courts[newCourtIdx]) {
      checkAvailability(selectedDate, courts[newCourtIdx]?.name || `Court ${newCourtIdx + 1}`);
    }
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    // Check for conflicts in real-time
    if (newStartTime && endTime) {
      const hasConflict = checkSlotConflict(newStartTime, endTime);
      setSlotConflict(hasConflict);
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    // Check for conflicts in real-time
    if (startTime && newEndTime) {
      const hasConflict = checkSlotConflict(startTime, newEndTime);
      setSlotConflict(hasConflict);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Book Venue</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{venue.name}</h3>
            <p className="text-sm text-gray-600">{venue.address}</p>
          </div>

          {bookingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{bookingError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Court
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={selectedCourtIdx}
                onChange={handleCourtChange}
              >
                {courts.map((c, idx) => (
                  <option key={idx} value={idx}>
                    {c?.name || `Court ${idx + 1}`} — ₹{Number(c?.perHourPrice ?? c?.pricePerHour ?? 0)} / hour
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Availability Status */}
            {availabilityLoading && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">Checking availability...</p>
              </div>
            )}

            {!availabilityLoading && bookedSlots.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">Booked Time Slots:</p>
                <div className="space-y-1">
                  {bookedSlots.map((slot, idx) => (
                    <p key={idx} className="text-xs text-yellow-700">
                      {slot.start} - {slot.end}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {!availabilityLoading && bookedSlots.length === 0 && selectedDate && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">✅ All time slots available for this date</p>
              </div>
            )}

            {slotConflict && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">⚠️ This time slot conflicts with an existing booking</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    slotConflict ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  value={startTime}
                  onChange={handleStartTimeChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    slotConflict ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  value={endTime}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-emerald-600">₹{computedPrice}</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={paying || slotConflict}
                  onClick={onConfirmBooking}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {paying ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedSportId, setSelectedSportId] = useState(null);

  // booking state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedCourtIdx, setSelectedCourtIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [paying, setPaying] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");
  
  // availability state
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotConflict, setSlotConflict] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`${base}/venues/${id}`);
        setVenue(data?.data || data);
        setActivePhotoIndex(0);
        setSelectedSportId(null);
      } catch (err) {
        setError("Failed to load venue");
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  // Check availability when date or court changes
  const checkAvailability = async (date, courtName) => {
    if (!date || !courtName || !venue) return;
    
    try {
      setAvailabilityLoading(true);
      setSlotConflict(false);
      
      const { data } = await axios.get(`${base}/venues/availability`, {
        params: {
          venueId: venue._id || venue.id,
          court: courtName,
          date: date
        }
      });
      
      setBookedSlots(data.bookedSlots || []);
    } catch (err) {
      console.error("Failed to check availability:", err);
      setBookedSlots([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Check for slot conflicts
  const checkSlotConflict = (start, end) => {
    if (!start || !end || bookedSlots.length === 0) return false;
    
    return bookedSlots.some(slot => {
      const slotStart = slot.start;
      const slotEnd = slot.end;
      
      // Check if the new booking overlaps with existing bookings
      return (start < slotEnd && end > slotStart);
    });
  };

  // derive values safely regardless of loading state
  const photos =
    Array.isArray(venue?.photos) && venue?.photos.length
      ? venue.photos.map(normalizePhoto)
      : [];
  const rating = Number(venue?.averageRating ?? 0).toFixed(1);

  const sports = Array.isArray(venue?.sports) ? venue.sports : [];
  const selectedSport =
    sports.find((s) => (s._id || s.id) === selectedSportId) || null;
  const courts = Array.isArray(venue?.courts) ? venue.courts : [];
  const selectedCourt = courts[selectedCourtIdx] || null;
  const pricePerHour = Number(
    selectedCourt?.perHourPrice ?? selectedCourt?.pricePerHour ?? 0
  );
  const durationMinutes = parseDurationMinutes(startTime, endTime);
  const computedPrice =
    durationMinutes > 0 ? Math.ceil((durationMinutes / 60) * pricePerHour) : 0;

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("qc_user") || "null");
    } catch {
      return null;
    }
  })();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || "Venue not found"}</p>
        </div>
      </div>
    );
  }

  const handleStartBooking = () => {
    if (!user) {
      navigate("/login");
    } else {
      setBookingOpen(true);
      setBookingSuccess("");
      setBookingError("");
      setSlotConflict(false);
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = tomorrow.toISOString().split('T')[0];
      setSelectedDate(defaultDate);
      
      // Check availability for default date and first court
      if (courts.length > 0) {
        const firstCourt = courts[0];
        checkAvailability(defaultDate, firstCourt?.name || `Court 1`);
      }
    }
  };

  const handleConfirmBooking = async () => {
    try {
      // basic client-side validation
      if (!selectedDate || !startTime || !endTime) {
        setBookingError("Please select date, start and end time");
        return;
      }
      if (parseDurationMinutes(startTime, endTime) <= 0) {
        setBookingError("End time must be after start time");
        return;
      }

      // Check for slot conflicts
      const hasConflict = checkSlotConflict(startTime, endTime);
      if (hasConflict) {
        setSlotConflict(true);
        setBookingError("This time slot conflicts with an existing booking. Please choose a different time.");
        return;
      }

      setPaying(true);
      setBookingError("");
      setBookingSuccess("");
      setSlotConflict(false);
      // Simulated payment
      await new Promise((r) => setTimeout(r, 800));

      const payload = {
        venue: venue._id || venue.id,
        court: selectedCourt?.name || `Court ${selectedCourtIdx + 1}`,
        sport: selectedSportId || sports[0]?._id || sports[0]?.id,
        date: selectedDate,
        timeSlot: { start: startTime, end: endTime },
        totalPrice: computedPrice,
      };

      await axios.post(`${base}/bookings/`, payload, { withCredentials: true });

      setBookingSuccess("Your booking has been confirmed successfully!");
      setBookingOpen(false);
    } catch (err) {
      setBookingError(err.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{venue.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartBooking}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Book This Venue
          </button>
        </div>

        {/* Image gallery */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            {photos[activePhotoIndex] ? (
              <img
                src={photos[activePhotoIndex]}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {photos.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt="thumbnail"
                  onMouseEnter={() => setActivePhotoIndex(i)}
                  onFocus={() => setActivePhotoIndex(i)}
                  onClick={() => setActivePhotoIndex(i)}
                  className={`h-16 w-full object-cover rounded cursor-pointer transition-all border-2 hover:border-emerald-400 ${
                    i === activePhotoIndex ? "border-emerald-500" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Sports Available */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Sports Available</h2>
                <span className="text-xs text-gray-500">
                  Click on sports to view pricing
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {sports.map((s) => {
                  const sid = s._id || s.id;
                  const active = sid === selectedSportId;
                  return (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => setSelectedSportId(active ? null : sid)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>

              {/* Price chart */}
              {selectedSport && (
                <div className="mt-6 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Pricing — {selectedSport.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedSportId(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                  {courts.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 pr-4 font-medium text-gray-900">Court</th>
                            <th className="text-left py-3 font-medium text-gray-900">Price per hour</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {courts
                            .filter((c) => {
                              const courtName = c?.name?.toLowerCase() || '';
                              const sportName = selectedSport?.name?.toLowerCase() || '';
                              return courtName.includes(sportName) || sportName.includes(courtName);
                            })
                            .map((c, idx) => {
                              const price = c?.perHourPrice ?? c?.pricePerHour ?? 0;
                              return (
                                <tr key={idx}>
                                  <td className="py-3 pr-4 text-gray-900">
                                    {c?.name || `Court ${idx + 1}`}
                                  </td>
                                  <td className="py-3 font-semibold text-emerald-600">₹{Number(price)}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No pricing available for {selectedSport.name}.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(venue.amenities || []).map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="capitalize">
                      {String(a).replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About Venue</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {venue.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Operating Hours</h3>
              {venue.openingHours?._24hours ? (
                <div className="text-sm text-gray-700">Open 24 hours</div>
              ) : (
                <div className="space-y-2 text-sm">
                  {Object.entries(venue.openingHours || {})
                    .filter(([k]) => k !== "_24hours")
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-600">{dayKeyToLabel[k] || k}</span>
                        <span className="text-gray-900 font-medium">
                          {v?.open && v?.close ? `${v.open} - ${v.close}` : "Closed"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Address</h3>
              <p className="text-gray-700 mb-3">{venue.address}</p>
              {venue.googleMapLink && (
                <a
                  href={venue.googleMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        venue={venue}
        courts={courts}
        sports={sports}
        onConfirmBooking={handleConfirmBooking}
        paying={paying}
        bookingError={bookingError}
        selectedCourtIdx={selectedCourtIdx}
        setSelectedCourtIdx={setSelectedCourtIdx}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        computedPrice={computedPrice}
        checkAvailability={checkAvailability}
        availabilityLoading={availabilityLoading}
        bookedSlots={bookedSlots}
        slotConflict={slotConflict}
        checkSlotConflict={checkSlotConflict}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!bookingSuccess}
        onClose={() => setBookingSuccess("")}
        message={bookingSuccess}
      />
    </div>
  );
};

export default VenueDetails;