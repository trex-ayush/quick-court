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

  // derive values safely regardless of loading state
  const photos =
    Array.isArray(venue?.photos) && venue?.photos.length
      ? venue.photos.map(normalizePhoto)
      : [];
  const rating = Number(venue?.averageRating ?? 0).toFixed(1);
  const activePhoto = photos[activePhotoIndex] || photos[0];

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
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }
  if (error || !venue) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-red-600">
        {error || "Venue not found"}
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

      setPaying(true);
      setBookingError("");
      setBookingSuccess("");
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

      setBookingSuccess("Booking confirmed!");
      setBookingOpen(false);
    } catch (err) {
      setBookingError(err.response?.data?.error || "Booking failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{venue.name}</h1>
            <div className="mt-1 text-sm text-slate-600 flex items-center gap-3 flex-wrap">
              <span>📍 {venue.address}</span>
              <span>⭐ {rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartBooking}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold"
            >
              Book This Venue
            </button>
          </div>
        </div>

        {/* Image gallery */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-3">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
            {photos[activePhotoIndex] ? (
              <img
                src={photos[activePhotoIndex]}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-400">
                No image
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {photos.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt="thumb"
                  onMouseEnter={() => setActivePhotoIndex(i)}
                  onFocus={() => setActivePhotoIndex(i)}
                  onClick={() => setActivePhotoIndex(i)}
                  className={`h-16 w-full object-cover rounded-md cursor-pointer transition ring-2 ring-transparent hover:ring-blue-400 ${
                    i === activePhotoIndex ? "ring-blue-500" : ""
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right rail info */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Sports Available */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Sports Available</h2>
                <span className="text-xs text-slate-500">
                  Click on sports to view price chart
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {sports.map((s) => {
                  const sid = s._id || s.id;
                  const active = sid === selectedSportId;
                  return (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => setSelectedSportId(active ? null : sid)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                        active
                          ? "border-purple-400 bg-purple-100 text-purple-800"
                          : "hover:border-slate-300"
                      }`}
                    >
                      <span>🏆</span>
                      {s.name}
                    </button>
                  );
                })}
              </div>

              {/* Price chart */}
              {selectedSport && (
                <div className="mt-5 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
                      Price Chart — {selectedSport.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedSportId(null)}
                      className="text-sm text-slate-600 hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  {courts.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-500">
                            <th className="py-2 pr-4">Court</th>
                            <th className="py-2">Price/hour</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courts.map((c, idx) => {
                            const price =
                              c?.perHourPrice ?? c?.pricePerHour ?? 0;
                            return (
                              <tr key={idx} className="border-t">
                                <td className="py-2 pr-4">
                                  {c?.name || `Court ${idx + 1}`}
                                </td>
                                <td className="py-2">₹{Number(price)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">
                      No pricing available.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4">
              <h2 className="font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {(venue.amenities || []).map((a) => (
                  <div
                    key={a}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <span>✅</span>
                    <span className="capitalize">
                      {String(a).replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4">
              <h2 className="font-semibold mb-3">About Venue</h2>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {venue.description}
              </p>
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="font-semibold">Operating Hours</h3>
              {venue.openingHours?._24hours ? (
                <div className="mt-2 text-sm">Open 24 hours</div>
              ) : (
                <div className="mt-2 space-y-1 text-sm">
                  {Object.entries(venue.openingHours || {})
                    .filter(([k]) => k !== "_24hours")
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span>{dayKeyToLabel[k] || k}</span>
                        <span>
                          {v?.open && v?.close
                            ? `${v.open} - ${v.close}`
                            : "Closed"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="font-semibold">Address</h3>
              <p className="mt-2 text-sm text-slate-700">{venue.address}</p>
              {venue.googleMapLink && (
                <a
                  href={venue.googleMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-blue-600 text-sm underline"
                >
                  Open in Google Maps
                </a>
              )}
            </div>

            {/* Booking Drawer */}
            {bookingOpen && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
                <h3 className="font-semibold mb-3">Complete your booking</h3>
                {bookingError && (
                  <div className="mb-2 text-sm text-red-600">
                    {bookingError}
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Court
                    </label>
                    <select
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                      value={selectedCourtIdx}
                      onChange={(e) =>
                        setSelectedCourtIdx(Number(e.target.value))
                      }
                    >
                      {courts.map((c, idx) => (
                        <option key={idx} value={idx}>
                          {c?.name || `Court ${idx + 1}`} — ₹
                          {Number(c?.perHourPrice ?? c?.pricePerHour ?? 0)} / hr
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="font-semibold">₹{computedPrice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={paying}
                      onClick={handleConfirmBooking}
                      className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 disabled:opacity-50"
                    >
                      {paying ? "Processing..." : "Pay & Book"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingOpen(false)}
                      className="rounded-md border border-slate-300 px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {bookingSuccess && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-700">
                {bookingSuccess}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VenueDetails;
