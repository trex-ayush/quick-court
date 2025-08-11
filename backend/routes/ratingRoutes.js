const express = require("express");
const router = express.Router();

// Ratings CRUD
router.get("/" /* getAllRatings */);
router.get("/:ratingId" /* getRatingById */);
router.post("/" /* createRating */);
router.put("/:ratingId" /* updateRating */);
router.delete("/:ratingId" /* deleteRating */);

// Related to Venue & User
router.get("/venue/:venueId" /* getRatingsForVenue */);
router.get("/user/:userId" /* getRatingsByUser */);

module.exports = router;
