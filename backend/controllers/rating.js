const Rating = require("../models/rating");

// controllers/rating.js
const Venue = require("../models/venue");
const Booking = require("../models/booking");

async function updateVenueAverage(venueId) {
  const result = await Rating.aggregate([
    { $match: { venue: venueId } },
    {
      $group: {
        _id: "$venue",
        averageScore: { $avg: "$score" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Venue.findByIdAndUpdate(venueId, {
      averageRating: result[0].averageScore,
      totalRatings: result[0].totalRatings,
    });
  } else {
    await Venue.findByIdAndUpdate(venueId, {
      averageRating: 0,
      totalRatings: 0,
    });
  }
}

exports.addRating = async (req, res) => {
  try {
    const { venueId, score, comment } = req.body;

    // Ensure user has a past or completed booking for this venue
    const now = new Date();
    const hasEligibleBooking = await Booking.exists({
      user: req.user._id,
      venue: venueId,
      status: { $in: ["confirmed", "completed"] },
      date: { $lt: now }, // booking date in the past
    });

    if (!hasEligibleBooking) {
      return res.status(403).json({
        error: "You can rate a venue only after a completed booking.",
      });
    }

    const rating = await Rating.create({
      user: req.user._id,
      venue: venueId,
      score,
      comment,
    });

    await updateVenueAverage(venueId);

    res.status(201).json(rating);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "You have already rated this venue" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { score, comment } = req.body;

    const rating = await Rating.findOneAndUpdate(
      { _id: ratingId, user: req.user._id },
      { score, comment },
      { new: true, runValidators: true }
    );

    if (!rating) {
      return res
        .status(404)
        .json({ error: "Rating not found or not authorized" });
    }

    await updateVenueAverage(rating.venue);

    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await Rating.findOneAndDelete({
      _id: ratingId,
      user: req.user._id,
    });

    if (!rating) {
      return res
        .status(404)
        .json({ error: "Rating not found or not authorized" });
    }

    await updateVenueAverage(rating.venue);

    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
