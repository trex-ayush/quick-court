// controllers/booking.js
const Booking = require("../models/booking");
const Venue = require("../models/venue");
const Sport = require("../models/sport");
const mongoose = require("mongoose");

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { venue, court, sport, date, timeSlot, totalPrice } = req.body;

    // Validate venue
    const venueExists = await Venue.findById(venue);
    if (!venueExists) return res.status(404).json({ error: "Venue not found" });

    // Validate sport
    const sportExists = await Sport.findById(sport);
    if (!sportExists) return res.status(404).json({ error: "Sport not found" });

    const booking = await Booking.create({
      user: req.user._id,
      venue,
      court,
      sport,
      date,
      timeSlot,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get my bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({
      date: -1,
    });
    // Return raw array to align with current frontend usage
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all bookings (admin/owner)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update booking (e.g., change time slot)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ error: "Only confirmed bookings can be updated" });
    }

    Object.assign(booking, req.body);
    await booking.save();

    res.status(200).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: update booking status
exports.adminUpdateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["confirmed", "cancelled", "completed", "no-show"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid booking status" });
    }
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.status = status;
    await booking.save();
    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get bookings for owner's venues
exports.getOwnerBookings = async (req, res) => {
  try {
    // First get all venues owned by the current user
    const Venue = require("../models/venue");
    const ownedVenues = await Venue.find({ owner: req.user._id }).select("_id");
    const venueIds = ownedVenues.map((venue) => venue._id);

    if (venueIds.length === 0) {
      return res.status(200).json([]);
    }

    // Get all bookings for these venues
    const bookings = await Booking.find({
      venue: { $in: venueIds },
    })
      .populate("user", "name email")
      .populate("venue", "name address")
      .populate("sport", "name")
      .sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Owner cancel booking for their venue
exports.ownerCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    // First check if the booking exists and belongs to a venue owned by the current user
    const booking = await Booking.findById(bookingId).populate("venue");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if the venue belongs to the current owner
    const Venue = require("../models/venue");
    const venue = await Venue.findOne({
      _id: booking.venue._id,
      owner: req.user._id,
    });

    if (!venue) {
      return res
        .status(403)
        .json({ error: "You can only cancel bookings for your own venues" });
    }

    // Check if booking is in the future
    const bookingDate = new Date(booking.date);
    const now = new Date();
    if (bookingDate < now) {
      return res.status(400).json({ error: "Cannot cancel past bookings" });
    }

    // Update booking status
    booking.status = "cancelled";
    booking.cancellationReason = reason || "Cancelled by venue owner";
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
