import React, { useEffect, useState } from "react";
import axios from "axios";
import { base } from "../helper";
import Breadcrumb from "../components/Breadcrumb";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Cancel Booking Modal
const CancelBookingModal = ({ isOpen, onClose, booking, onCancel, loading }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cancel Booking</h3>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Venue:</strong> {booking?.venue?.name}<br />
              <strong>User:</strong> {booking?.user?.name}<br />
              <strong>Date:</strong> {booking?.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}<br />
              <strong>Time:</strong> {booking?.timeSlot?.start} - {booking?.timeSlot?.end}<br />
              <strong>Amount:</strong> ₹{booking?.totalPrice?.toLocaleString() || 0}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="3"
              placeholder="Enter reason for cancellation..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onCancel(reason)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch venues and bookings in parallel
        const [venuesResponse, bookingsResponse] = await Promise.all([
          axios.get(`${base}/venues/my`, { withCredentials: true }),
          axios.get(`${base}/bookings/owner`, { withCredentials: true })
        ]);
        
        setVenues(venuesResponse.data.data || []);
        setBookings(bookingsResponse.data || []);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Enhanced statistics calculations
  const totalVenues = venues.length;
  const totalBookings = bookings.length;
  
  // Revenue calculations - exclude cancelled bookings
  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');
  const completedBookings = bookings.filter(booking => booking.status === 'completed');
  
  const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const pendingRevenue = pendingBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const cancelledRevenue = cancelledBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const completedRevenue = completedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  
  const activeBookings = confirmedBookings.length;
  const totalActiveRevenue = totalRevenue + pendingRevenue;

  // Calculate average booking value
  const averageBookingValue = totalBookings > 0 ? totalActiveRevenue / totalBookings : 0;

  // Prepare enhanced chart data
  const venueStatusData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          venues.filter(v => v.status === 'approved').length,
          venues.filter(v => v.status === 'pending').length,
          venues.filter(v => v.status === 'rejected').length,
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const bookingStatusData = {
    labels: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
    datasets: [
      {
        data: [
          confirmedBookings.length,
          pendingBookings.length,
          cancelledBookings.length,
          completedBookings.length,
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
        borderWidth: 0,
      },
    ],
  };

  // Revenue breakdown by status
  const revenueByStatusData = {
    labels: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [totalRevenue, pendingRevenue, cancelledRevenue, completedRevenue],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
        borderWidth: 2,
        borderColor: ['#059669', '#D97706', '#DC2626', '#2563EB'],
      },
    ],
  };

  // Monthly revenue data (only confirmed and completed bookings)
  const monthlyRevenue = {};
  const monthlyBookings = {};
  const monthlyCancellations = {};
  
  bookings.forEach(booking => {
    const month = new Date(booking.date).toLocaleDateString('en-US', { month: 'short' });
    const year = new Date(booking.date).getFullYear();
    const monthKey = `${month} ${year}`;
    
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (booking.totalPrice || 0);
      monthlyBookings[monthKey] = (monthlyBookings[monthKey] || 0) + 1;
    } else if (booking.status === 'cancelled') {
      monthlyCancellations[monthKey] = (monthlyCancellations[monthKey] || 0) + 1;
    }
  });

  const revenueData = {
    labels: Object.keys(monthlyRevenue),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: Object.values(monthlyRevenue),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Booking trends over time
  const bookingTrendsData = {
    labels: Object.keys(monthlyBookings),
    datasets: [
      {
        label: 'Successful Bookings',
        data: Object.values(monthlyBookings),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'Cancelled Bookings',
        data: Object.values(monthlyCancellations),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Venue performance data
  const venuePerformance = venues.map(venue => {
    const venueBookings = bookings.filter(booking => booking.venue?._id === venue._id);
    const venueRevenue = venueBookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'completed')
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const venueCancellations = venueBookings.filter(booking => booking.status === 'cancelled').length;
    
    return {
      name: venue.name,
      revenue: venueRevenue,
      bookings: venueBookings.length,
      cancellations: venueCancellations,
      cancellationRate: venueBookings.length > 0 ? (venueCancellations / venueBookings.length) * 100 : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const venuePerformanceData = {
    labels: venuePerformance.slice(0, 5).map(v => v.name),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: venuePerformance.slice(0, 5).map(v => v.revenue),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  // Handle booking cancellation
  const handleCancelBooking = async (reason) => {
    if (!selectedBooking) return;

    try {
      setCancelLoading(true);
      await axios.post(`${base}/bookings/${selectedBooking._id}/cancel`, 
        { reason }, 
        { withCredentials: true }
      );
      
      // Update the booking in the local state
      setBookings(prev => prev.map(booking => 
        booking._id === selectedBooking._id 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      
      setCancelModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle venue availability toggle
  const handleToggleAvailability = async (venueId) => {
    try {
      setToggleLoading(prev => ({ ...prev, [venueId]: true }));
      
      const response = await axios.post(`${base}/venues/${venueId}/toggle-availability`, {}, 
        { withCredentials: true }
      );
      
      // Update the venue in the local state
      setVenues(prev => prev.map(venue => 
        venue._id === venueId 
          ? { ...venue, isActive: response.data.venue.isActive }
          : venue
      ));
      
    } catch (err) {
      console.error('Failed to toggle venue availability:', err);
      alert(err.response?.data?.error || 'Failed to toggle venue availability');
    } finally {
      setToggleLoading(prev => ({ ...prev, [venueId]: false }));
    }
  };

  // Check if booking can be cancelled (future booking)
  const canCancelBooking = (booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    return bookingDate > now && booking.status !== 'cancelled';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb />
        <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Venues</p>
                <p className="text-2xl font-semibold text-gray-900">{totalVenues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{totalBookings}</p>
                <p className="text-xs text-gray-500">{activeBookings} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₹{totalActiveRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">₹{averageBookingValue.toFixed(0)} avg/booking</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancellation Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalBookings > 0 ? ((cancelledBookings.length / totalBookings) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500">{cancelledBookings.length} cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown by Booking Status</h3>
          <div className="h-64">
            <Bar 
              data={revenueByStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString();
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Venue Status Distribution</h3>
            <div className="h-64">
              <Doughnut 
                data={venueStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Booking Status Distribution</h3>
            <div className="h-64">
              <Doughnut 
                data={bookingStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        {Object.keys(monthlyRevenue).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
            <div className="h-64">
              <Line 
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₹' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Booking Trends Chart */}
        {Object.keys(monthlyBookings).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Booking Trends</h3>
            <div className="h-64">
              <Line 
                data={bookingTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Top Performing Venues */}
        {venuePerformance.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Top Performing Venues</h3>
            <div className="h-64">
              <Bar 
                data={venuePerformanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₹' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Venues Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Venues</h2>
          {venues.length === 0 ? (
            <div className="text-gray-600 text-center py-8">You have not added any venues yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venues.map((venue) => {
                const venueStats = venuePerformance.find(v => v.name === venue.name) || {
                  revenue: 0,
                  bookings: 0,
                  cancellations: 0,
                  cancellationRate: 0
                };

                return (
                  <div key={venue._id || venue.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-3">
                      {venue.photos && venue.photos[0] ? (
                        <img src={venue.photos[0]} alt={venue.name} className="w-16 h-16 object-cover rounded-lg border" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{venue.name}</h3>
                        <p className="text-sm text-gray-500">{venue.address}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {/* Availability Toggle */}
                        <button
                          onClick={() => handleToggleAvailability(venue._id || venue.id)}
                          disabled={toggleLoading[venue._id || venue.id]}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            venue.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } ${toggleLoading[venue._id || venue.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {toggleLoading[venue._id || venue.id] ? '...' : venue.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          venue.status === 'approved' ? 'bg-green-100 text-green-800' :
                          venue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {venue.status}
                        </span>
                      </div>
                      <div><span className="font-medium">Sports:</span> {venue.sports?.map(s => s.name).join(", ") || "-"}</div>
                      <div><span className="font-medium">Revenue:</span> ₹{venueStats.revenue.toLocaleString()}</div>
                      <div><span className="font-medium">Bookings:</span> {venueStats.bookings} ({venueStats.cancellationRate.toFixed(1)}% cancelled)</div>
                      <div><span className="font-medium">Created:</span> {formatDate(venue.createdAt)}</div>
                    </div>
                    <button
                      className="mt-3 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                      onClick={() => navigate(`/venues/${venue._id || venue.id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                      onClick={() => navigate(`/venues/${venue._id || venue.id}/edit`)}
                    >
                      Edit Venue
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bookings Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-gray-600 text-center py-8">No bookings found for your venues.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.venue?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(booking.timeSlot?.start)} - {formatTime(booking.timeSlot?.end)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.court}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{booking.totalPrice?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setCancelModalOpen(true);
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onCancel={handleCancelBooking}
        loading={cancelLoading}
      />
    </div>
  );
};

export default OwnerDashboard;
