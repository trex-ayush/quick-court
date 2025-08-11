const express = require("express");
const router = express.Router();

// Booking CRUD
router.get("/" /* getAllBookings */);
router.get("/:bookingId" /* getBookingById */);
router.post("/" /* createBooking */);
router.put("/:bookingId" /* updateBooking */);
router.delete("/:bookingId" /* cancelBooking */);

// By Venue & User
router.get("/venue/:venueId" /* getBookingsForVenue */);
router.get("/user/:userId" /* getBookingsByUser */);

module.exports = router;
