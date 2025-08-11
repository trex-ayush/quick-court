const express = require("express");
const { protectedUser } = require("../middleware/auth");
const {
  addRating,
  updateRating,
  deleteRating,
} = require("../controllers/rating");
const router = express.Router();

router.post("/", protectedUser, addRating);
router.put("/:ratingId", protectedUser, updateRating);
router.delete("/:ratingId", protectedUser, deleteRating);
// Moved venue ratings fetch to venue routes: GET /venues/:venueId/ratings

module.exports = router;
