const mongoose = require("mongoose");

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Amenity name is required"],
      unique: true,
      enum: [
        "parking",
        "showers",
        "lockers",
        "wifi",
        "cafe",
        "equipment-rental",
        "changing-rooms",
        "bleachers",
        "lighting",
        "water-cooler",
        "ac",
        "heating",
        "first-aid",
      ],
      lowercase: true,
    },
    icon: {
      type: String,
      required: true,
      default: "⭐",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Amenity", amenitySchema);
