const express = require("express");
const { protectedUser } = require("../middleware/auth");
const {
  addRating,
  updateRating,
  deleteRating,
} = require("../controllers/rating");
const { getVenueWithRatings } = require("../controllers/venue");
const router = express.Router();

router.post("/", protectedUser, addRating);
router.put("/:ratingId", protectedUser, updateRating);
router.delete("/:ratingId", protectedUser, deleteRating);
router.get("/:id", getVenueWithRatings);

module.exports = router;
