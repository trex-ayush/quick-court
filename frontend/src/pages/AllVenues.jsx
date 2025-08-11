import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { base } from "../helper";
import venueImg from "../assets/login.jpg";

const apiOrigin = base.replace(/\/api\/?$/, "");

const getVenuePrimaryImage = (venue) => {
  const photo = venue?.photos?.[0];
  if (!photo) return venueImg;
  if (/^https?:\/\//i.test(photo)) return photo;
  const normalized = String(photo).replaceAll("\\", "/");
  return `${apiOrigin}/${normalized.startsWith("/") ? normalized.slice(1) : normalized}`;
};

const AllVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchVenues = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${base}/venues/`, {
        params: { page: pageNum, limit: 12 },
      });
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">All Venues</h1>
          <div className="text-sm text-slate-500">Page {page} of {pages}</div>
        </div>

        {loading && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-md bg-red-50 text-red-700 px-4 py-3">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {venues.map((venue) => {
                const key = venue.id || venue._id;
                const rating = Number(venue?.averageRating || 0).toFixed(1);
                const imageSrc = getVenuePrimaryImage(venue);
                const sportLabel = venue?.sports?.[0]?.name || (venue?.sports?.length > 1 ? "Multi-sport" : "Sport");
                const tags = Array.isArray(venue?.amenities) ? venue.amenities.slice(0, 3) : [];
                return (
                  <article key={key} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg transition">
                    <div className="relative">
                      <img src={imageSrc} alt={venue?.name || "Venue"} className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                        <span>⭐</span>
                        <span>{rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-lg leading-snug">{venue?.name}</h4>
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{sportLabel}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{venue?.address}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">{tag}</span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">Details</button>
                        <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">Book now</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={prevPage} disabled={page <= 1} className="px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-50">Previous</button>
              <button onClick={nextPage} disabled={page >= pages} className="px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AllVenues;
