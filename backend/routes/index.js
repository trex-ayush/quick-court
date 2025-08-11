const express = require("express");
const router = express.Router();

// Import route files
const userRoute = require("./userRoutes");
const venueRoute = require("./venueRoutes");
const sportRoute = require("./sportRoutes");
const ratingRoute = require("./ratingRoutes");
const bookingRoute = require("./bookingRoutes");

// Mount routes
router.use("/users", userRoute);
router.use("/venues", venueRoute);
router.use("/sports", sportRoute);
router.use("/ratings", ratingRoute);
router.use("/bookings", bookingRoute);

module.exports = router;
