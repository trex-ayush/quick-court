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
} = require("../controllers/venue");
const { protectedOwner, protectedAdmin, protectedUser } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.get("/", getAllVenues);
router.get("/search", searchVenues);
router.get("/:venueId", getVenueById);
router.post("/createVenue", protectedOwner, protectedAdmin,upload.array("photos", 5), createVenue);
router.put("/:venueId", protectedOwner, protectedAdmin, updateVenue);
router.delete("/:venueId", protectedOwner, protectedAdmin, deleteVenue);
router.get("/:id", getVenueWithRatings);


router.post("/:venueId/approve", protectedAdmin, approveVenue);
router.post("/:venueId/reject", protectedAdmin, rejectVenue);
router.post("/:venueId/ban", protectedAdmin, toggleBanVenue);

module.exports = router;
