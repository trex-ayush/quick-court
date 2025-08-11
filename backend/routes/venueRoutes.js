const express = require("express");
const router = express.Router();

// Venue CRUD
router.get("/" /* getAllVenues */);
router.get("/:venueId" /* getVenueById */);
router.post("/" /* createVenue */);
router.put("/:venueId" /* updateVenue */);
router.delete("/:venueId" /* deleteVenue */);

// Owner & Search
router.get("/owner/:ownerId" /* getVenuesByOwner */);
router.get("/search" /* searchVenues */);

// Admin Actions
router.post("/:venueId/approve" /* approveVenue */);
router.post("/:venueId/reject" /* rejectVenue */);
router.post("/:venueId/ban" /* banVenue */);

module.exports = router;
