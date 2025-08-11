const express = require("express");
const router = express.Router();

// Import route files
const userRoute = require("./userRoutes");
// const venueRoute = require("./venueRoutes");
// const ratingRoute = require("./ratingRoutes");
// const bookingRoute = require("./bookingRoutes");
// const amenityRoute = require("./amenityRoutes");

// Mount routes
router.use("/users", userRoute);
// router.use("/venues", venueRoute);
// router.use("/ratings", ratingRoute);
// router.use("/bookings", bookingRoute);
// router.use("/amenities", amenityRoute);

module.exports = router;
