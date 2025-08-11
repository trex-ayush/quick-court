// routes/booking.js
const express = require("express");
const { protectedUser, protectedAdmin } = require("../middleware/auth");
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,
  cancelBooking,
} = require("../controllers/booking");

const router = express.Router();

router.post("/", protectedUser, createBooking);
router.get("/me", protectedUser, getMyBookings);
router.get("/", protectedAdmin, getAllBookings);
router.put("/:id", protectedUser, updateBooking);
router.delete("/:id", protectedUser, cancelBooking);

module.exports = router;
