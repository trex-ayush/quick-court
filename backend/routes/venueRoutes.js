const express = require("express");
const {
  getAllVenues,
  searchVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  approveVenue,
  rejectVenue,
  toggleBanVenue,
  getVenueWithRatings,
  checkVenueAvailability,
  getMyVenues,
  toggleVenueAvailability,
} = require("../controllers/venue");
const {
  protectedOwner,
  protectedAdmin,
  protectedUser,
} = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", getAllVenues);
// Search venues
router.get("/search", searchVenues);
router.get("/availability", checkVenueAvailability);
router.get("/my", protectedOwner, getMyVenues);
router.get("/:venueId", getVenueById);

// Allow owners or admins to create (protectedOwner already allows admin)
router.post(
  "/createVenue",
  protectedOwner,
  upload.array("photos", 5),
  createVenue
);

// FIXED: Allow owners or admins to update their venue with file upload
router.put(
  "/:venueId", 
  protectedOwner, 
  upload.array("photos", 5), // Added file upload middleware
  updateVenue
);

router.delete("/:venueId", protectedOwner, deleteVenue);
router.post(
  "/:venueId/toggle-availability",
  protectedOwner,
  toggleVenueAvailability
);

// Ratings and comments for a venue
router.get("/:venueId/ratings", getVenueWithRatings);

// Admin routes
router.post("/:venueId/approve", protectedAdmin, approveVenue);
router.post("/:venueId/reject", protectedAdmin, rejectVenue);
router.post("/:venueId/ban", protectedAdmin, toggleBanVenue);

module.exports = router;