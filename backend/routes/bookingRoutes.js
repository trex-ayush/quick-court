// routes/booking.js
const express = require("express");
const {
  protectedUser,
  protectedAdmin,
  protectedOwner,
} = require("../middleware/auth");
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,
  cancelBooking,
  getOwnerBookings,
  ownerCancelBooking,
  adminUpdateBookingStatus,
} = require("../controllers/booking");

const router = express.Router();

router.post("/", protectedUser, createBooking);
router.get("/me", protectedUser, getMyBookings);
router.get("/owner", protectedOwner, getOwnerBookings);
router.get("/", protectedAdmin, getAllBookings);
router.put("/:id/status", protectedAdmin, adminUpdateBookingStatus);
router.put("/:id", protectedUser, updateBooking);
router.delete("/:id", protectedUser, cancelBooking);
router.post("/:bookingId/cancel", protectedOwner, ownerCancelBooking);

module.exports = router;
