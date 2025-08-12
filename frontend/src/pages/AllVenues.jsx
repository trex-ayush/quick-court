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

const MIN_PRICE = 20;
const MAX_PRICE = 5000;
const PRICE_STEP = 50;

const PriceRangeSlider = ({ minValue, maxValue, onChange }) => {
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);
  const [isDragging, setIsDragging] = useState(null);

  // Update local state when props change
  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
  }, [minValue, maxValue]);

  const getPercent = (val) =>
    Math.round(((val - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100);

  const leftPercent = getPercent(Math.min(localMin, localMax));
  const rightPercent = getPercent(Math.max(localMin, localMax));

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), localMax - PRICE_STEP);
    setLocalMin(val);
    onChange({ min: val, max: localMax });
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), localMin + PRICE_STEP);
    setLocalMax(val);
    onChange({ min: localMin, max: val });
  };

  const handleMouseDown = (thumb) => {
    setIsDragging(thumb);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(null);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-semibold">
          ₹{localMin.toLocaleString()}
        </span>
        <span className="text-slate-400 text-xs">to</span>
        <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-semibold">
          ₹{localMax.toLocaleString()}
        </span>
      </div>

      <div className="relative px-3 py-6">
        {/* Track background */}
        <div className="absolute left-3 right-3 top-1/2 transform -translate-y-1/2 h-3 rounded-full bg-slate-200" />

        {/* Active range track */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"
          style={{ 
            left: `${leftPercent}%`, 
            width: `${rightPercent - leftPercent}%`,
            marginLeft: '12px',
            marginRight: '12px'
          }}
        />

        {/* Min range input */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={localMin}
          onChange={handleMinChange}
          onMouseDown={() => handleMouseDown('min')}
          onMouseUp={handleMouseUp}
          className={`absolute w-full h-3 bg-transparent appearance-none cursor-pointer slider-thumb ${
            isDragging === 'min' ? 'z-30' : 'z-20'
          }`}
          style={{ 
            background: 'transparent',
            outline: 'none'
          }}
        />

        {/* Max range input */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={localMax}
          onChange={handleMaxChange}
          onMouseDown={() => handleMouseDown('max')}
          onMouseUp={handleMouseUp}
          className={`absolute w-full h-3 bg-transparent appearance-none cursor-pointer slider-thumb ${
            isDragging === 'max' ? 'z-30' : 'z-20'
          }`}
          style={{ 
            background: 'transparent',
            outline: 'none'
          }}
        />
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 3px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          position: relative;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: #2563eb;
        }
        
        .slider-thumb::-webkit-slider-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 3px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .slider-thumb::-moz-range-track {
          background: transparent;
          border: none;
        }
        
        .slider-thumb::-webkit-slider-runnable-track {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};

const AllVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState({ city: "", venueName: "" });
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Filter states
  const [venueType, setVenueType] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: MIN_PRICE, max: MAX_PRICE });
  const [selectedSports, setSelectedSports] = useState([]);
  const navigate = useNavigate();

  // Legacy filter states (keeping for compatibility)
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minRating, setMinRating] = useState(0);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch all venues at once for client-side pagination
      const { data } = await axios.get(`${base}/venues/`, {
        params: { status: "approved" }, // Remove pagination params to get all venues
      });
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setVenues(list);
      // Calculate total pages based on filtered results (will be updated in useEffect)
      // Removed setPages(1) - let useEffect handle it
    } catch (err) {
      setError("Failed to load venues. Please try again.");
      setVenues([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const searchVenues = async () => {
    try {
      setSearchLoading(true);
      setError("");
      
      // If no search query, fetch all venues
      if (!searchQuery.city && !searchQuery.venueName) {
        await fetchVenues();
        return;
      }
      
      // Build search params
      const params = {};
      if (searchQuery.city) params.city = searchQuery.city;
      if (searchQuery.venueName) params.venueName = searchQuery.venueName;
      
      const { data } = await axios.get(`${base}/venues/search`, { params });
      
      if (data.venues) {
        setVenues(data.venues);
        setTotalPages(data.totalPages || 1);
        setPage(1); // Reset to first page after search
      } else {
        setVenues([]);
        setTotalPages(1);
      }
      
    } catch (err) {
      setError("Search failed. Please try again.");
      setVenues([]);
      setTotalPages(1);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const allSports = useMemo(() => {
    const set = new Set();
    venues.forEach((v) =>
      v?.sports?.forEach((s) => s?.name && set.add(s.name))
    );
    return ["All", ...Array.from(set)];
  }, [venues]);

  const filtered = useMemo(() => {
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
      
      return nameOk && sportOk && ratingOk && priceOk && typeOk;
    });
    return filteredVenues;
  }, [venues, query, sport, minRating, minPrice, maxPrice, venueType]);

  // Client-side pagination
  const ITEMS_PER_PAGE = 6;
  const paginatedVenues = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, endIndex);
    // console.log('Pagination Debug - Page:', page, 'Start:', startIndex, 'End:', endIndex, 'Paginated count:', paginated.length);
    return paginated;
  }, [filtered, page]);

  // Update total pages when filtered results change
  useEffect(() => {
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    // console.log('Pagination Debug - Filtered length:', filtered.length, 'ITEMS_PER_PAGE:', ITEMS_PER_PAGE, 'Total pages:', totalPages);
    setTotalPages(totalPages);
  }, [filtered.length]); // Only depend on filtered.length

  // Reset page when total pages changes
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      // console.log('Pagination Debug - Resetting page from', page, 'to 1 because total pages is', totalPages);
      setPage(1);
    }
  }, [totalPages, page]);

  const nextPage = () => {
    // console.log('Next Page Debug - Current page:', page, 'Total pages:', totalPages, 'Can go next:', page < totalPages);
    if (page < totalPages) {
      const p = page + 1;
      setPage(p);
      // No need to refetch, filtered will update based on current venues
    }
  };
  const prevPage = () => {
    console.log('Prev Page Debug - Current page:', page, 'Can go prev:', page > 1);
    if (page > 1) {
      const p = page - 1;
      setPage(p);
      // No need to refetch, filtered will update based on current venues
    }
  };

  const clearFilters = () => {
    setQuery("");
    setSport("All");
    setMinRating(0);
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setVenueType("all");
    setPriceRange({ min: MIN_PRICE, max: MAX_PRICE });
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
          
          {/* Search Summary */}
          {(searchQuery.city || searchQuery.venueName) && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800 font-medium">
                🔍 Search Results for:
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {searchQuery.city && <span className="mr-3">📍 City: {searchQuery.city}</span>}
                {searchQuery.venueName && <span>🏟️ Venue: {searchQuery.venueName}</span>}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              📍 <span>{filtered.length} venues found</span>
            </span>
            {totalPages > 1 && (
              <span className="text-xs text-slate-400">
                (Page {page} of {totalPages})
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-8">
          {/* Enhanced Sidebar Filters */}
          <aside className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 h-fit shadow-lg sticky top-4">
            <div className="space-y-6">
              <div className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                🔍 Filter Venues
              </div>

              {/* Search Section */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-sm font-semibold text-blue-800">
                  🔎 Search Venues
                </div>
                
                {/* City Search */}
                <div>
                  <label className="block text-xs font-medium mb-2 text-blue-700">
                    City/Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchQuery.city}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, city: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && searchVenues()}
                  />
                </div>
                
                {/* Search Button */}
                <button
                  onClick={searchVenues}
                  disabled={searchLoading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {searchLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      🔍 Search 
                    </>
                  )}
                </button>
                
                {/* Clear Search */}
                {(searchQuery.city || searchQuery.venueName) && (
                  <button
                    onClick={() => {
                      setSearchQuery({ city: "", venueName: "" });
                      fetchVenues();
                    }}
                    className="w-full px-3 py-1 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                  >
                    ✕ Clear Search
                  </button>
                )}
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
                <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
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

          {/* Enhanced Results Grid - Larger Cards */}
          <div>
            {loading && (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-96 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"
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
                {paginatedVenues.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏟️</div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      {searchQuery.city || searchQuery.venueName ? "No venues found" : "No venues available"}
                    </h3>
                    <p className="text-slate-500 mb-6">
                      {searchQuery.city || searchQuery.venueName 
                        ? `No venues match your search criteria. Try adjusting your search terms.`
                        : "There are currently no venues available. Please check back later."
                      }
                    </p>
                    {(searchQuery.city || searchQuery.venueName) && (
                      <button
                        onClick={() => {
                          setSearchQuery({ city: "", venueName: "" });
                          fetchVenues();
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        🔄 Show All Venues
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Larger Cards Grid */}
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                      {paginatedVenues.map((venue) => {
                        const key = venue.id || venue._id;
                        const rating = Number(venue?.averageRating || 0).toFixed(1);
                        const imageSrc = getVenuePrimaryImage(venue);
                        const sportLabel =
                          venue?.sports?.[0]?.name ||
                          (venue?.sports?.length > 1 ? "Multi-sport" : "Sport");
                        const tags = Array.isArray(venue?.amenities)
                          ? venue.amenities.slice(0, 4)
                          : [];
                        const minPrice = getMinPrice(venue);

                        return (
                          <article
                            key={key}
                            className="group overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                          >
                            <div className="relative overflow-hidden">
                              <img
                                src={imageSrc}
                                alt={venue?.name || "Venue"}
                                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              {/* Rating Badge */}
                              <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1.5 text-sm text-white font-medium">
                                <span className="text-yellow-400">⭐</span>
                                <span>{rating}</span>
                              </div>
                              
                              {/* Sport Badge */}
                              <div className="absolute right-4 top-4">
                                <span className="inline-block rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-700">
                                  {sportLabel}
                                </span>
                              </div>

                              {/* Price Badge */}
                              {minPrice && (
                                <div className="absolute left-4 bottom-4">
                                  <span className="inline-block rounded-full bg-green-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                                    ₹{minPrice}/hr
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="p-6">
                              <div className="mb-4">
                                <h4 className="font-bold text-xl leading-tight text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                  {venue?.name}
                                </h4>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
                                  <span>📍</span>
                                  {venue?.address}
                                </p>
                                
                                {/* Venue Type */}
                                {venue?.venueType && (
                                  <div className="mb-3">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                      venue.venueType === 'indoor' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {venue.venueType === 'indoor' ? '🏢' : '🌤️'}
                                      {venue.venueType.charAt(0).toUpperCase() + venue.venueType.slice(1)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Sports List */}
                              {venue?.sports && venue.sports.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-xs font-medium text-slate-600 mb-2">Available Sports:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {venue.sports.slice(0, 3).map((sport, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium"
                                      >
                                        {sport.name}
                                      </span>
                                    ))}
                                    {venue.sports.length > 3 && (
                                      <span className="inline-block bg-slate-200 text-slate-600 px-2 py-1 rounded-full text-xs font-medium">
                                        +{venue.sports.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Amenities */}
                              {tags.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-xs font-medium text-slate-600 mb-2">Amenities:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-block rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2 py-1 text-xs font-medium"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Price and Rating Info */}
                              <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="text-sm font-semibold text-slate-700">{rating}</span>
                                  <span className="text-xs text-slate-500">rating</span>
                                </div>
                                {minPrice && (
                                  <div className="text-right">
                                    <div className="text-xs text-slate-500">Starting from</div>
                                    <div className="text-lg font-bold text-green-600">₹{minPrice}/hr</div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => navigate(`/venues/${key}`)}
                                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                  👀 View Details
                                </button>
                                <button
                                  onClick={() => navigate(`/venues/${key}/book`)}
                                  className="rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-blue-700 transition-all duration-200"
                                >
                                  📅 Book Now
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {/* Enhanced Pagination - Only show when there are venues */}
                    {paginatedVenues.length > 0 && totalPages > 1 && (
                      <div className="mt-12 flex items-center justify-center gap-4">
                        <button
                          onClick={prevPage}
                          disabled={page <= 1}
                          className="px-6 py-3 rounded-xl border-2 border-slate-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                        >
                          ⬅️ Previous
                        </button>
                        <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold">
                          Page {page} of {totalPages}
                        </div>
                        <button
                          onClick={nextPage}
                          disabled={page >= totalPages}
                          className="px-6 py-3 rounded-xl border-2 border-slate-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                        >
                          Next ➡️
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllVenues;