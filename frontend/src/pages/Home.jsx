import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Mock images as fallback or default images
const venueImg =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop";
const sportImg =
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop";
const heroImg =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=800&fit=crop";

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4 text-amber-500"
    aria-hidden="true"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.03 3.155a1 1 0 00.95.69h3.316c.969 0 1.371 1.24.588 1.81l-2.683 1.95a1 1 0 00-.364 1.118l1.025 3.136c.3.919-.755 1.688-1.54 1.118l-2.69-1.956a1 1 0 00-1.176 0l-2.69 1.956c-.784.57-1.838-.199-1.539-1.118l1.024-3.136a1 1 0 00-.363-1.118L2.065 8.582c-.783-.57-.38-1.81.588-1.81h3.316a1 1 0 00.95-.69l1.03-3.155z" />
  </svg>
);

const SocialDot = ({ label, icon }) => (
  <div
    aria-label={label}
    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 cursor-pointer border border-white/20"
  >
    {icon}
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      setError("");
      try {
        const base = "http://localhost:8000/api"; // Replace with your real base URL
        const { data } = await axios.get(`${base}/venues/`, {
          params: { status: "approved" },
        });
        const venuesData = Array.isArray(data.data) ? data.data : [];
        setVenues(venuesData.slice(0, 6));
      } catch (err) {
        setError("Failed to fetch venues");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const getVenuePrimaryImage = (venue) => {
    const photo = venue?.photos?.[0];
    if (photo) return photo;
    if (venue?.sports?.some((s) => s.name === "Tennis")) return sportImg;
    return venueImg;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleVenueClick = (venueId) => {
    console.log(`Viewing venue: ${venueId}`);
    // Implement actual navigation or modal popup as needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8)), url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-600/20 px-4 py-2 text-sm font-medium text-white border border-white/20 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Trusted by 10,000+ athletes nationwide
            </div>

            <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              Book Premium Sports
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                Venues
              </span>
            </h1>

            <p className="mt-6 text-xl text-slate-300 max-w-2xl leading-relaxed">
              Discover and reserve world-class sports facilities with real-time
              availability, premium amenities, and seamless booking experience.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => handleNavigation("/venues")}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 min-w-[220px]"
              >
                Explore Venues
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl">
              {[
                { label: "Premium Venues", value: "500+" },
                { label: "Major Cities", value: "25+" },
                { label: "Happy Members", value: "50K+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl" />
      </section>

      {/* Featured Venues Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Featured Venues
              </h2>
              <p className="text-slate-600 text-lg">Handpicked premium sports facilities</p>
            </div>
            <button
              onClick={() => handleNavigation("/venues")}
              className="hidden sm:inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              View All Venues
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
          {loading && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-80 rounded-2xl bg-slate-200 animate-pulse"
                />
              ))}
            </div>
          )}
          {!loading && error && (
            <p className="text-center text-red-500">{error}</p>
          )}
          {!loading && !error && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {venues.map((venue) => {
                const firstSport = venue?.sports?.[0]?.name;
                const sportLabel =
                  firstSport || (venue?.sports?.length > 1 ? "Multi-sport" : "Sport");
                const rating = Number(venue?.averageRating || 0).toFixed(1);
                const imageSrc = getVenuePrimaryImage(venue);
                const tags = Array.isArray(venue?.amenities)
                  ? venue.amenities.slice(0, 2)
                  : [];
                return (
                  <article
                    key={venue.id}
                    className="group overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    onClick={() => handleVenueClick(venue.id)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={venue?.name || "Venue"}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                        <StarIcon />
                        <span>{rating}</span>
                      </div>
                      <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                        {sportLabel}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-xl text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {venue?.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-1">
                        {venue?.address}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 font-medium mb-8">
            Trusted by leading sports communities across India
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {["SportElite", "PlayPro", "ActiveLife", "CourtMaster"].map(
              (brand) => (
                <div
                  key={brand}
                  className="flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-white p-6 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <span className="text-slate-400 font-bold text-lg">
                    {brand}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Visual Gallery */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 overflow-hidden rounded-3xl shadow-xl">
              <img
                src={heroImg}
                alt="Premium sports facilities"
                className="h-80 w-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="grid grid-rows-2 gap-6">
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <img
                  src={sportImg}
                  alt="Active community"
                  className="h-38 w-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <img
                  src={venueImg}
                  alt="Modern amenities"
                  className="h-38 w-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-4">Booking</h4>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Browse Sports
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    All Venues
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Find Location
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Join Now
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Member Benefits
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Payments</h4>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing Plans
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Payment Methods
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    QuickPay
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Careers</h4>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Open Positions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Culture
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Why QuickCourt
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sports Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Membership
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-slate-400 text-sm text-center md:text-left max-w-2xl">
                By using QuickCourt, you agree to our terms of service and
                privacy policy. We're committed to protecting your data and
                providing exceptional service.
                <a
                  href="#"
                  className="text-white hover:text-slate-300 transition-colors ml-1"
                >
                  Learn more
                </a>
              </p>
              <div className="flex items-center gap-4">
                <SocialDot
                  label="LinkedIn"
                  icon={
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.208 24 24 23.227 24 22.271V1.729C24 .774 23.208 0 22.225 0z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
