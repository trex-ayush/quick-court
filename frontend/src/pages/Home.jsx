import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import venueImg from "../assets/login.jpg";
import sportImg from "../assets/sign-up.jpg";
import heroImg from "../assets/venue.jpg";
import { base } from "../helper";

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4 text-yellow-400"
    aria-hidden="true"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.03 3.155a1 1 0 00.95.69h3.316c.969 0 1.371 1.24.588 1.81l-2.683 1.95a1 1 0 00-.364 1.118l1.025 3.136c.3.919-.755 1.688-1.54 1.118l-2.69-1.956a1 1 0 00-1.176 0l-2.69 1.956c-.784.57-1.838-.199-1.539-1.118l1.024-3.136a1 1 0 00-.363-1.118L2.065 8.582c-.783-.57-.38-1.81.588-1.81h3.316a1 1 0 00.95-.69l1.03-3.155z" />
  </svg>
);

const SocialDot = ({ label }) => (
  <span
    aria-label={label}
    className="inline-block w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition"
  />
);

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

const Home = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sports = [
    { id: 1, name: "Badminton", img: sportImg },
    { id: 2, name: "Football", img: sportImg },
    { id: 3, name: "Cricket", img: sportImg },
    { id: 4, name: "Swimming", img: sportImg },
    { id: 5, name: "Tennis", img: sportImg },
    { id: 6, name: "Table Tennis", img: sportImg },
  ];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`${base}/venues/`, {
          params: { page: 1, limit: 10 },
        });
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setVenues(list.slice(0, 10));
      } catch (err) {
        setError("Failed to load venues. Please try again.");
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Navbar */}
      

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-28 text-white">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs sm:text-sm ring-1 ring-white/20 backdrop-blur">
              Book courts in seconds
            </p>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Find players and venues nearby
            </h2>
            <p className="mt-3 sm:mt-4 text-white/85 max-w-xl">
              Seamlessly explore sports venues and connect with enthusiasts just
              like you.
            </p>

            <div className="mt-6 sm:mt-8 bg-white rounded-xl p-2 sm:p-3 shadow-xl ring-1 ring-black/5">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Search venues or players"
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Ahmedabad</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bengaluru</option>
                </select>
                <button className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Venues */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Book Venues
          </h3>
          <button onClick={() => navigate("/venues")} className="text-blue-600 text-sm hover:underline">
            See all venues
          </button>
        </div>

        {loading && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-md bg-red-50 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {venues.slice(0, 10).map((venue) => {
              const key = venue.id || venue._id;
              const firstSport = venue?.sports?.[0]?.name;
              const sportLabel =
                firstSport ||
                (venue?.sports?.length > 1 ? "Multi-sport" : "Sport");
              const rating = Number(venue?.averageRating || 0).toFixed(1);
              const imageSrc = getVenuePrimaryImage(venue);
              const tags = Array.isArray(venue?.amenities)
                ? venue.amenities.slice(0, 3)
                : [];

              return (
                <article
                  key={key}
                  className="group overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg transition"
                >
                  <div className="relative">
                    <img
                      src={imageSrc}
                      alt={venue?.name || "Venue"}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                      <StarIcon />
                      <span>{rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-lg leading-snug">
                        {venue?.name}
                      </h4>
                      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {sportLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {venue?.address}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
                        Details
                      </button>
                      <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
                        Book now
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Popular Sports Carousel */}
      <section className="bg-slate-50/60 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
            Popular Sports
          </h3>
          <Slider {...sliderSettings}>
            {sports.map((sport) => (
              <div key={sport.id} className="px-2">
                <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition">
                  <img
                    src={sport.img}
                    alt={sport.name}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-3 text-center">
                    <span className="font-semibold">{sport.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-xl sm:text-2xl font-bold">Ready to play?</h4>
              <p className="text-white/90">
                Join QuickCourt and start booking courts instantly.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-md bg-white px-4 py-2 text-blue-700 font-medium hover:bg-blue-50">
                Create account
              </button>
              <button className="rounded-md border border-white/60 px-4 py-2 font-medium hover:bg-white/10">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-3">Book</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Browse by sport
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  View all venues
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Find a venue
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Join</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Become a member
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  How it works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Payments</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Get pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Payment options
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  QuickCourt Pay
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">About</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  About QuickCourt
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Media
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Careers</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Search jobs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">More</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  Help & Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Why QuickCourt
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Sports Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Membership Plans
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-white/90 text-center md:text-left">
              By using quickcourt.com, you consent to the monitoring and storing
              of your interactions with the website for improving and
              personalizing our services. See our{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
            <div className="flex items-center gap-3">
              <SocialDot label="YouTube" />
              <SocialDot label="Instagram" />
              <SocialDot label="TikTok" />
              <SocialDot label="Facebook" />
            </div>
          </div>
          <div className="text-center py-3 text-xs">
            © {new Date().getFullYear()} QuickCourt Services, LLC
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
