const Sport = require("../models/sport");

// Get all sports
exports.getAllSports = async (req, res) => {
  try {
    const sports = await Sport.find();
    res.json(sports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get sport by ID
exports.getSportById = async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      return res.status(404).json({ error: "Sport not found" });
    }
    res.json(sport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create sport
exports.createSport = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check for duplicates
    const existing = await Sport.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: "Sport already exists" });
    }

    const sport = await Sport.create({
      name,
      description,
    });

    res.status(201).json(sport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update sport
exports.updateSport = async (req, res) => {
  try {
    const sport = await Sport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!sport) {
      return res.status(404).json({ error: "Sport not found" });
    }

    res.json(sport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete sport
exports.deleteSport = async (req, res) => {
  try {
    const sport = await Sport.findByIdAndDelete(req.params.id);
    if (!sport) {
      return res.status(404).json({ error: "Sport not found" });
    }
    res.json({ message: "Sport deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Increment booking count
exports.incrementBookingCount = async (sportId) => {
  try {
    await Sport.findByIdAndUpdate(sportId, { $inc: { bookingCount: 1 } });
  } catch (err) {
    console.error("Error incrementing booking count:", err.message);
  }
};
