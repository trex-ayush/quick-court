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
          const val = c?.perHourPrice ?? c?.pricePerHour;
          return Number(val);
        })
        .filter((n) => Number.isFinite(n) && n > 0)
    : [];
  if (!prices.length) return undefined;
  return Math.min(...prices);
};

// Price range options for dropdown
const PRICE_RANGES = [
  { label: "Any Price", value: "all", min: 0, max: Infinity },
  { label: "₹20 - ₹500", value: "budget", min: 20, max: 500 },
  { label: "₹500 - ₹1500", value: "standard", min: 500, max: 1500 },
  { label: "₹1500 - ₹3000", value: "premium", min: 1500, max: 3000 },
  { label: "₹3000+", value: "luxury", min: 3000, max: Infinity },
];

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
  const [priceRange, setPriceRange] = useState("all");
  const navigate = useNavigate();

  // Legacy filter states
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("name");

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${base}/venues/`, {
        params: {
          status: "approved",
          isActive: true,
          "banInfo.isBanned": false,
        },
      });
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setVenues(list);
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

      if (!searchQuery.city && !searchQuery.venueName) {
        await fetchVenues();
        return;
      }

      const params = {};
      if (searchQuery.city) params.city = searchQuery.city;
      if (searchQuery.venueName) params.venueName = searchQuery.venueName;

      const { data } = await axios.get(`${base}/venues/search`, { params });

      if (data.venues) {
        setVenues(data.venues);
        setTotalPages(data.totalPages || 1);
        setPage(1);
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
    let filteredVenues = venues.filter((v) => {
      const nameOk = v?.name?.toLowerCase().includes(query.toLowerCase());
      const sportOk =
        sport === "All" || (v?.sports || []).some((s) => s?.name === sport);
      const ratingValue = Number(v?.averageRating || 0);
      const ratingOk = ratingValue >= minRating;
      
      const price = getMinPrice(v);
      const selectedRange = PRICE_RANGES.find(r => r.value === priceRange);
      const priceOk = selectedRange?.value === "all" || 
        (price !== undefined && price >= selectedRange.min && price <= selectedRange.max);

      const typeOk =
        venueType === "all" ||
        (venueType === "indoor" && v?.venueType === "indoor") ||
        (venueType === "outdoor" && v?.venueType === "outdoor");

      return nameOk && sportOk && ratingOk && priceOk && typeOk;
    });

    // Sort venues
    filteredVenues.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return Number(b?.averageRating || 0) - Number(a?.averageRating || 0);
        case "price_low":
          const priceA = getMinPrice(a) || 0;
          const priceB = getMinPrice(b) || 0;
          return priceA - priceB;
        case "price_high":
          const priceA2 = getMinPrice(a) || 0;
          const priceB2 = getMinPrice(b) || 0;
          return priceB2 - priceA2;
        default:
          return (a?.name || "").localeCompare(b?.name || "");
      }
    });

    return filteredVenues;
  }, [venues, query, sport, minRating, priceRange, venueType, sortBy]);

  // Client-side pagination
  const ITEMS_PER_PAGE = 9;
  const paginatedVenues = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, page]);

  useEffect(() => {
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setTotalPages(totalPages);
  }, [filtered.length]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page]);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setSport("All");
    setMinRating(0);
    setPriceRange("all");
    setVenueType("all");
    setSortBy("name");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb />

        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Sports Venues
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover and book premium sports facilities in your city
          </p>

          {/* Search Summary */}
          {(searchQuery.city || searchQuery.venueName) && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Active Search
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                {searchQuery.city && (
                  <div>Location: {searchQuery.city}</div>
                )}
                {searchQuery.venueName && (
                  <div>Venue: {searchQuery.venueName}</div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-6 text-gray-600">
            <span>{filtered.length} venues found</span>
            {totalPages > 1 && (
              <span className="text-sm">Page {page} of {totalPages}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                Filters
              </div>

              {/* Search Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-semibold text-gray-900">
                  Search Venues
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    City/Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery.city}
                    onChange={(e) =>
                      setSearchQuery((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => e.key === "Enter" && searchVenues()}
                  />
                </div>

                <button
                  onClick={searchVenues}
                  disabled={searchLoading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition-colors"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>

                {(searchQuery.city || searchQuery.venueName) && (
                  <button
                    onClick={() => {
                      setSearchQuery({ city: "", venueName: "" });
                      fetchVenues();
                    }}
                    className="w-full px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Venue Name Search */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Venue Name
                </label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Sort By
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>

              {/* Sport Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Sport Type
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                >
                  {allSports.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Price Range (per hour)
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  {PRICE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Venue Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Venue Type
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "indoor", label: "Indoor" },
                    { value: "outdoor", label: "Outdoor" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="vtype"
                        value={value}
                        checked={venueType === value}
                        onChange={(e) => setVenueType(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[
                    { value: 4, label: "4+ stars" },
                    { value: 3, label: "3+ stars" },
                    { value: 2, label: "2+ stars" },
                    { value: 1, label: "1+ stars" },
                    { value: 0, label: "All ratings" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === value}
                        onChange={() => setMinRating(value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full rounded-md bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Results Grid */}
          <div>
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-80 rounded-lg bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-lg bg-red-50 text-red-700 px-6 py-4 border border-red-200">
                <span className="font-medium">{error}</span>
              </div>
            )}

            {!loading && !error && (
              <>
                {paginatedVenues.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      {searchQuery.city || searchQuery.venueName
                        ? "No venues found"
                        : "No venues available"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery.city || searchQuery.venueName
                        ? "No venues match your search criteria. Try adjusting your filters."
                        : "There are currently no venues available."}
                    </p>
                    {(searchQuery.city || searchQuery.venueName) && (
                      <button
                        onClick={() => {
                          setSearchQuery({ city: "", venueName: "" });
                          fetchVenues();
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                      >
                        Show All Venues
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Venues Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedVenues.map((venue) => {
                        const key = venue.id || venue._id;
                        const rating = Number(venue?.averageRating || 0).toFixed(1);
                        const imageSrc = getVenuePrimaryImage(venue);
                        const minPrice = getMinPrice(venue);

                        return (
                          <div
                            key={key}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                          >
                            <div className="relative">
                              <img
                                src={imageSrc}
                                alt={venue?.name || "Venue"}
                                className="h-48 w-full object-cover"
                              />
                              
                              {/* Rating Badge */}
                              <div className="absolute top-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                                ★ {rating}
                              </div>

                              {/* Price Badge */}
                              {minPrice && (
                                <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                                  ₹{minPrice}/hr
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="mb-3">
                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                  {venue?.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {venue?.address}
                                </p>
                              </div>

                              {/* Venue Type */}
                              {venue?.venueType && (
                                <div className="mb-3">
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    venue.venueType === "indoor"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                  }`}>
                                    {venue.venueType.charAt(0).toUpperCase() + venue.venueType.slice(1)}
                                  </span>
                                </div>
                              )}

                              {/* Sports */}
                              {venue?.sports && venue.sports.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-xs font-medium text-gray-600 mb-2">
                                    Sports:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {venue.sports.slice(0, 2).map((sport, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                      >
                                        {sport.name}
                                      </span>
                                    ))}
                                    {venue.sports.length > 2 && (
                                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                        +{venue.sports.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Stats */}
                              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                                <span>Rating: {rating}</span>
                                {minPrice && (
                                  <span className="font-medium text-green-600">
                                    From ₹{minPrice}/hr
                                  </span>
                                )}
                              </div>

                              {/* Action Button */}
                              <button
                                onClick={() => navigate(`/venues/${key}`)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {paginatedVenues.length > 0 && totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-4">
                        <button
                          onClick={prevPage}
                          disabled={page <= 1}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700">
                          Page {page} of {totalPages}
                        </span>
                        <button
                          onClick={nextPage}
                          disabled={page >= totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
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