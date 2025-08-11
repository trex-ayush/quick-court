import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { base } from "../helper";
import venueImg from "../assets/login.jpg";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const apiOrigin = base.replace(/\/api\/?$/, "");

const getVenuePrimaryImage = (venue) => {
  const photo = venue?.photos?.[0];
  if (!photo) return venueImg;
  if (/^https?:\/\//i.test(photo)) return photo;
  const normalized = String(photo).replaceAll("\\", "/");
  return `${apiOrigin}/${
    normalized.startsWith("/") ? normalized.slice(1) : normalized
  }`;
};

const getMinPrice = (venue) => {
  const prices = Array.isArray(venue?.courts)
    ? venue.courts
        .map((c) => {
          const val = c?.perHourPrice ?? c?.pricePerHour; // support both keys
          return Number(val);
        })
        .filter((n) => Number.isFinite(n) && n > 0)
    : [];
  if (!prices.length) return undefined;
  return Math.min(...prices);
};

const MIN_PRICE = 100;
const MAX_PRICE = 5000;
const PRICE_STEP = 50;

const PriceRangeSlider = ({ minValue, maxValue, onChange }) => {
  const [active, setActive] = React.useState(null); // 'min' | 'max' | null

  const getPercent = (val) =>
    Math.round(((val - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100);

  const left = getPercent(Math.min(minValue, maxValue));
  const right = getPercent(Math.max(minValue, maxValue));

  const handleMin = (e) => {
    const val = Math.min(Number(e.target.value), maxValue - PRICE_STEP);
    onChange({ min: val, max: maxValue });
  };

  const handleMax = (e) => {
    const val = Math.max(Number(e.target.value), minValue + PRICE_STEP);
    onChange({ min: minValue, max: val });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-medium text-slate-700">
        <span className="bg-slate-100 px-2 py-1 rounded text-xs">
          ₹{minValue}
        </span>
        <span className="bg-slate-100 px-2 py-1 rounded text-xs">
          ₹{maxValue}
        </span>
      </div>
      <div className="relative px-2 py-4">
        {/* Track */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-2 rounded-full bg-slate-200" />

        {/* Active track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />

        {/* Min range input */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={minValue}
          onChange={handleMin}
          onMouseDown={() => setActive("min")}
          onTouchStart={() => setActive("min")}
          className={`absolute left-0 right-0 w-full h-2 appearance-none bg-transparent cursor-pointer slider-thumb ${
            active === "min" ? "z-30" : "z-20"
          }`}
        />

        {/* Max range input */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={maxValue}
          onChange={handleMax}
          onMouseDown={() => setActive("max")}
          onTouchStart={() => setActive("max")}
          className={`absolute left-0 right-0 w-full h-2 appearance-none bg-transparent cursor-pointer slider-thumb ${
            active === "max" ? "z-30" : "z-20"
          }`}
        />
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

const AllVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const navigate = useNavigate();

  // Filters
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [venueType, setVenueType] = useState("all"); // all | indoor | outdoor
  const [minRating, setMinRating] = useState(0);

  const fetchVenues = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${base}/venues/`, {
        params: { page: pageNum, limit: 6, status: "approved" }, // Added status filter to only show approved venues
      });
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      console.log('Fetched venues:', list.length, 'Total pages:', data?.pagination?.pages, 'Current page:', pageNum); // Debug log
      console.log('Venue names:', list.map(v => ({ name: v?.name, status: v?.status, venueType: v?.venueType }))); // Debug log for venue details
      setVenues(list);
      const totalPages = Number(data?.pagination?.pages || 1);
      setPages(totalPages);
    } catch (err) {
      setError("Failed to load venues. Please try again.");
      setVenues([]);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues(1);
  }, []);

  const allSports = useMemo(() => {
    const set = new Set();
    venues.forEach((v) =>
      v?.sports?.forEach((s) => s?.name && set.add(s.name))
    );
    return ["All", ...Array.from(set)];
  }, [venues]);

  const filtered = useMemo(() => {
    console.log('Filtering venues:', venues.length, 'venues'); // Debug log
    const filteredVenues = venues.filter((v) => {
      const nameOk = v?.name?.toLowerCase().includes(query.toLowerCase());
      const sportOk =
        sport === "All" || (v?.sports || []).some((s) => s?.name === sport);
      const ratingValue = Number(v?.averageRating || 0);
      const ratingOk = ratingValue >= minRating;
      const price = getMinPrice(v);
      const priceOk =
        price === undefined || (price >= minPrice && price <= maxPrice);
      
      // Fixed venue type filtering to use venue.venueType instead of court.isOutdoor
      const typeOk =
        venueType === "all" ||
        (venueType === "indoor" && v?.venueType === "indoor") ||
        (venueType === "outdoor" && v?.venueType === "outdoor");
      
      // Debug log for filtered out venues
      if (!nameOk || !sportOk || !ratingOk || !priceOk || !typeOk) {
        console.log('Venue filtered out:', v?.name, {
          nameOk, sportOk, ratingOk, priceOk, typeOk,
          query, sport, minRating, minPrice, maxPrice, venueType,
          venueTypeValue: v?.venueType
        });
      }
      
      return nameOk && sportOk && ratingOk && priceOk && typeOk;
    });
    console.log('Filtered venues:', filteredVenues.length, 'out of', venues.length); // Debug log
    return filteredVenues;
  }, [venues, query, sport, minRating, minPrice, maxPrice, venueType]);

  const nextPage = () => {
    if (page < pages) {
      const p = page + 1;
      setPage(p);
      fetchVenues(p);
    }
  };
  const prevPage = () => {
    if (page > 1) {
      const p = page - 1;
      setPage(p);
      fetchVenues(p);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setSport("All");
    setMinRating(0);
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setVenueType("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />
        
        {/* Enhanced Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Sports Venues
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Discover and Book Nearby Venues for Your Favorite Sports
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              📍 <span>{filtered.length} venues found</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
          {/* Enhanced Sidebar Filters */}
          <aside className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 h-fit shadow-lg sticky top-4">
            <div className="space-y-6">
              <div className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                🔍 Filter Venues
              </div>

              {/* Enhanced Search */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700">
                  Search by venue name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type venue name..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    🔍
                  </div>
                </div>
              </div>

              {/* Enhanced Sport Filter */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700">
                  Filter by sport type
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                >
                  {allSports.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "🏆 All Sports" : `⚽ ${s}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enhanced Price Range */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700">
                  💰 Price range (per hour)
                </label>
                <PriceRangeSlider
                  minValue={minPrice}
                  maxValue={maxPrice}
                  onChange={({ min, max }) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                />
                <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
                  💡 Pricing shown when available from venue courts
                </p>
              </div>

              {/* Enhanced Venue Type */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700">
                  🏟️ Choose Venue Type
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "🌟 All Types", icon: "🌟" },
                    { value: "indoor", label: "🏢 Indoor", icon: "🏢" },
                    { value: "outdoor", label: "🌤️ Outdoor", icon: "🌤️" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        venueType === value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="vtype"
                        value={value}
                        checked={venueType === value}
                        onChange={(e) => setVenueType(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Enhanced Rating */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700">
                  ⭐ Rating Filter
                </label>
                <div className="space-y-2">
                  {[
                    { value: 4, label: "4+ stars", stars: "⭐⭐⭐⭐" },
                    { value: 3, label: "3+ stars", stars: "⭐⭐⭐" },
                    { value: 2, label: "2+ stars", stars: "⭐⭐" },
                    { value: 1, label: "1+ stars", stars: "⭐" },
                    { value: 0, label: "All ratings", stars: "🌟" },
                  ].map(({ value, label, stars }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        minRating === value
                          ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === value}
                        onChange={() => setMinRating(value)}
                        className="text-yellow-500"
                      />
                      <span className="text-xs">{stars}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Enhanced Clear Filters Button */}
              <button
                onClick={clearFilters}
                className="w-full rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 transform hover:scale-105"
              >
                🔄 Clear All Filters
              </button>
            </div>
          </aside>

          {/* Enhanced Results Grid */}
          <div>
            {loading && (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-80 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-6 py-4 border border-red-200">
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {filtered.map((venue) => {
                    const key = venue.id || venue._id;
                    const rating = Number(venue?.averageRating || 0).toFixed(1);
                    const imageSrc = getVenuePrimaryImage(venue);
                    const sportLabel =
                      venue?.sports?.[0]?.name ||
                      (venue?.sports?.length > 1 ? "Multi-sport" : "Sport");
                    const tags = Array.isArray(venue?.amenities)
                      ? venue.amenities.slice(0, 3)
                      : [];

                    return (
                      <article
                        key={key}
                        className="group overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={imageSrc}
                            alt={venue?.name || "Venue"}
                            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1.5 text-sm text-white font-medium">
                            <span className="text-yellow-400">⭐</span>
                            <span>{rating}</span>
                          </div>
                          <div className="absolute right-4 top-4">
                            <span className="inline-block rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-700">
                              {sportLabel}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-3">
                            <h4 className="font-bold text-xl leading-tight text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                              {venue?.name}
                            </h4>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <span>📍</span>
                              {venue?.address}
                            </p>
                          </div>

                          {tags.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block rounded-full bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => navigate(`/venues/${key}`)}
                              className="rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                            >
                              👀 View Details
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Enhanced Pagination */}
                <div className="mt-12 flex items-center justify-center gap-4">
                  <button
                    onClick={prevPage}
                    disabled={page <= 1}
                    className="px-6 py-3 rounded-xl border-2 border-slate-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                  >
                    ⬅️ Previous
                  </button>
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold">
                    Page {page} of {pages}
                  </div>
                  <button
                    onClick={nextPage}
                    disabled={page >= pages}
                    className="px-6 py-3 rounded-xl border-2 border-slate-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                  >
                    Next ➡️
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllVenues;
