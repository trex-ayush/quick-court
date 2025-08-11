const express = require("express");
const router = express.Router();

router.get("/" /* getAllAmenities */);
router.get("/:amenityId" /* getAmenityById */);
router.post("/" /* createAmenity */);
router.put("/:amenityId" /* updateAmenity */);
router.delete("/:amenityId" /* deleteAmenity */);

module.exports = router;
