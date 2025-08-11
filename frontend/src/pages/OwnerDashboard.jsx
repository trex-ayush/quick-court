import React, { useEffect, useState } from "react";
import axios from "axios";
import { base } from "../helper";
import Breadcrumb from "../components/Breadcrumb";
import { useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`${base}/venues/my`, { withCredentials: true });
        setVenues(data.data || []);
      } catch (err) {
        setError("Failed to load your venues");
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb />
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : venues.length === 0 ? (
          <div className="text-gray-600">You have not added any venues yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.map((venue) => (
              <div key={venue._id || venue.id} className="bg-white rounded-xl shadow border p-5 flex flex-col">
                <div className="flex items-center gap-4 mb-3">
                  {venue.photos && venue.photos[0] ? (
                    <img src={venue.photos[0]} alt={venue.name} className="w-20 h-20 object-cover rounded-lg border" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{venue.name}</h2>
                    <div className="text-sm text-gray-500">{venue.address}</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 text-sm text-gray-700">
                    <span className="font-medium">Status:</span> {venue.status}
                  </div>
                  <div className="mb-2 text-sm text-gray-700">
                    <span className="font-medium">Sports:</span> {venue.sports?.map(s => s.name).join(", ") || "-"}
                  </div>
                  <div className="mb-2 text-sm text-gray-700">
                    <span className="font-medium">Created:</span> {venue.createdAt ? new Date(venue.createdAt).toLocaleDateString() : "-"}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                    onClick={() => navigate(`/venues/${venue._id || venue.id}`)}
                  >
                    View Details
                  </button>
                  {/* Add more management actions here if needed */}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OwnerDashboard;
