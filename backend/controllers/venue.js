const Venue = require("../models/venue");
const Booking = require("../models/booking");
const mongoose = require("mongoose");

// GET ALL VENUES
exports.getAllVenues = async (req, res) => {
  try {
    let { page = 1, limit = 10, status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    
    // For regular users, only show active venues
    // For owners and admins, show all venues
    if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'admin')) {
      filter.isActive = true;
    }

    const venues = await Venue.find(filter)
      .populate("owner", "name email")
      .populate("sports", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Venue.countDocuments(filter);

    res.status(200).json({
      data: venues,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEARCH VENUES
exports.searchVenues = async (req, res) => {
  try {
    let { query, page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchFilter = {
      $text: { $search: query },
    };

    const venues = await Venue.find(searchFilter)
      .populate("owner", "name email")
      .populate("sports", "name")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Venue.countDocuments(searchFilter);

    res.status(200).json({
      data: venues,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET VENUE BY ID
exports.getVenueById = async (req, res) => {
  try {
    const { venueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({ error: "Invalid venue ID" });
    }

    const venue = await Venue.findById(venueId)
      .populate("owner", "name email")
      .populate("sports", "name");

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    res.status(200).json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE VENUE
exports.createVenue = async (req, res) => {
  try {
    const photoUrls = req.files?.map((file) => file.path) || [];

    if (photoUrls.length === 0) {
      return res.status(400).json({ error: "At least one photo is required" });
    }

    // Normalize body from multipart/form-data
    const body = { ...req.body };

    // Parse courts when sent as JSON string
    if (typeof body.courts === "string") {
      try {
        body.courts = JSON.parse(body.courts);
      } catch (e) {
        return res.status(400).json({ error: "Invalid courts payload" });
      }
    }

    // Convert perHourPrice to Number
    if (Array.isArray(body.courts)) {
      body.courts = body.courts.map((c) => ({
        name: c?.name,
        perHourPrice: Number(c?.perHourPrice) || 0,
      }));
    }

    // Reconstruct openingHours from bracketed keys
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const openingHours = {};
    if (body["openingHours[_24hours]"] !== undefined) {
      openingHours._24hours = String(body["openingHours[_24hours]"]) === "true";
      delete body["openingHours[_24hours]"];
    }
    days.forEach((d) => {
      const openKey = `openingHours[${d}][open]`;
      const closeKey = `openingHours[${d}][close]`;
      const open = body[openKey];
      const close = body[closeKey];
      if (open || close) {
        openingHours[d] = {};
        if (open) openingHours[d].open = open;
        if (close) openingHours[d].close = close;
      }
      if (openKey in body) delete body[openKey];
      if (closeKey in body) delete body[closeKey];
    });
    if (Object.keys(openingHours).length > 0) {
      body.openingHours = openingHours;
    }

    const venue = new Venue({
      ...body,
      owner: req.user._id,
      photos: photoUrls,
    });

    await venue.save();

    res.status(201).json(venue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE VENUE
exports.updateVenue = async (req, res) => {
  try {
    const { venueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({ error: "Invalid venue ID" });
    }

    // Normalize body from multipart/form-data
    const body = { ...req.body };

    // Parse courts when sent as JSON string
    if (typeof body.courts === "string") {
      try {
        body.courts = JSON.parse(body.courts);
      } catch (e) {
        return res.status(400).json({ error: "Invalid courts payload" });
      }
    }

    // Convert perHourPrice to Number for courts
    if (Array.isArray(body.courts)) {
      body.courts = body.courts.map((c) => ({
        name: c?.name,
        perHourPrice: Number(c?.perHourPrice) || 0,
      }));
    }

    // Reconstruct openingHours from bracketed keys
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const openingHours = {};
    if (body["openingHours[_24hours]"] !== undefined) {
      openingHours._24hours = String(body["openingHours[_24hours]"]) === "true";
      delete body["openingHours[_24hours]"];
    }
    days.forEach((d) => {
      const openKey = `openingHours[${d}][open]`;
      const closeKey = `openingHours[${d}][close]`;
      const open = body[openKey];
      const close = body[closeKey];
      if (open || close) {
        openingHours[d] = {};
        if (open) openingHours[d].open = open;
        if (close) openingHours[d].close = close;
      }
      if (openKey in body) delete body[openKey];
      if (closeKey in body) delete body[closeKey];
    });
    if (Object.keys(openingHours).length > 0) {
      body.openingHours = openingHours;
    }

    // Parse amenities if sent as string
    if (typeof body.amenities === "string") {
      try {
        body.amenities = JSON.parse(body.amenities);
      } catch (e) {
        body.amenities = body.amenities.split(',').map(a => a.trim());
      }
    }

    // Parse sports if sent as string
    if (typeof body.sports === "string") {
      try {
        body.sports = JSON.parse(body.sports);
      } catch (e) {
        body.sports = body.sports.split(',').map(s => s.trim());
      }
    }

    const updates = { ...body };

    // Handle photo updates
    if (req.files?.length) {
      const photoUrls = req.files.map((file) => file.path);
      // If replacing all photos, use $set, otherwise append
      if (body.replacePhotos === 'true') {
        updates.photos = photoUrls;
      } else {
        updates.$push = { photos: { $each: photoUrls } };
      }
    }

    // Remove fields that shouldn't be updated
    delete updates.owner;
    delete updates.status;
    delete updates.isVerified;
    delete updates.replacePhotos;

    const venue = await Venue.findOneAndUpdate(
      { _id: venueId, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate("sports", "name");

    if (!venue) {
      return res
        .status(404)
        .json({ error: "Venue not found or not authorized" });
    }

    res.status(200).json(venue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE VENUE
exports.deleteVenue = async (req, res) => {
  try {
    const { venueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({ error: "Invalid venue ID" });
    }

    const venue = await Venue.findOneAndDelete({
      _id: venueId,
      owner: req.user._id,
    });

    if (!venue) {
      return res
        .status(404)
        .json({ error: "Venue not found or not authorized" });
    }

    res.status(200).json({ message: "Venue deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: APPROVE VENUE
exports.approveVenue = async (req, res) => {
  try {
    const { venueId } = req.params;

    const venue = await Venue.findByIdAndUpdate(
      venueId,
      { status: "approved", isVerified: true },
      { new: true }
    );

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    res.status(200).json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: REJECT VENUE
exports.rejectVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { reason } = req.body;

    const venue = await Venue.findByIdAndUpdate(
      venueId,
      { status: "rejected", rejectionReason: reason },
      { new: true }
    );

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    res.status(200).json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: TOGGLE BAN VENUE
exports.toggleBanVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { reason } = req.body;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    venue.banInfo.isBanned = !venue.banInfo.isBanned;
    venue.banInfo.reason = reason || venue.banInfo.reason;
    venue.banInfo.bannedAt = venue.banInfo.isBanned ? new Date() : null;
    venue.banInfo.bannedBy = req.user._id;

    await venue.save();

    res.status(200).json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVenueWithRatings = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).populate({
      path: "ratings",
      select: "score comment user createdAt",
      populate: { path: "user", select: "name" },
    });

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check venue availability for a specific date and court
exports.checkVenueAvailability = async (req, res) => {
  try {
    const { venueId, court, date } = req.query;

    if (!venueId || !court || !date) {
      return res.status(400).json({ 
        error: "Venue ID, court, and date are required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({ error: "Invalid venue ID" });
    }

    // Check if venue exists and is active
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    if (!venue.isActive) {
      return res.status(400).json({ 
        error: "Venue is currently inactive and not accepting bookings",
        venueId,
        court,
        date,
        bookedSlots: [],
        available: false
      });
    }

    // Parse the date to start and end of day
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Find existing bookings for this venue, court, and date
    const existingBookings = await Booking.find({
      venue: venueId,
      court: court,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ["confirmed", "pending"] } // Only consider active bookings
    }).select("timeSlot");

    // Return the booked time slots
    const bookedSlots = existingBookings.map(booking => ({
      start: booking.timeSlot.start,
      end: booking.timeSlot.end
    }));

    res.status(200).json({
      venueId,
      court,
      date,
      bookedSlots,
      available: true // Will be updated by frontend logic
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MY VENUES (OWNER)
exports.getMyVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ owner: req.user._id })
      .populate("sports", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: venues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle venue availability (owner only)
exports.toggleVenueAvailability = async (req, res) => {
  try {
    const { venueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({ error: "Invalid venue ID" });
    }

    // Find venue owned by the current user
    const venue = await Venue.findOne({
      _id: venueId,
      owner: req.user._id
    });

    if (!venue) {
      return res.status(404).json({ error: "Venue not found or not authorized" });
    }

    // Toggle the isActive status
    venue.isActive = !venue.isActive;
    await venue.save();

    res.status(200).json({
      message: `Venue ${venue.isActive ? 'activated' : 'deactivated'} successfully`,
      venue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
