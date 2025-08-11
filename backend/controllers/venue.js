const Venue = require("../models/venue");
const mongoose = require("mongoose");

// GET ALL VENUES
exports.getAllVenues = async (req, res) => {
  try {
    let { page = 1, limit = 10, status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};
    if (status) filter.status = status;

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

    const updates = { ...req.body };

    // Append new uploaded photos if present
    if (req.files?.length) {
      const photoUrls = req.files.map((file) => file.path);
      updates.$push = { photos: { $each: photoUrls } };
    }

    const venue = await Venue.findOneAndUpdate(
      { _id: venueId, owner: req.user._id },
      updates,
      { new: true }
    );

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
