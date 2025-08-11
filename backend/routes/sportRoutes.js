// routes/sportRoutes.js
const express = require("express");
const {
  createSport,
  getAllSports,
  getSportById,
  updateSport,
  deleteSport,
} = require("../controllers/sport");
const { protectedAdmin } = require("../middleware/auth");
const router = express.Router();

router.post("/addSport", protectedAdmin, createSport);
router.get("/", getAllSports);
router.get("/:id", getSportById);
router.put("/:id", protectedAdmin, updateSport);
router.delete("/:id", protectedAdmin, deleteSport);

module.exports = router;
