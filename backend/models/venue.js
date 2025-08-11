const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      text: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [30, "Description should be at least 30 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    address: {
      type: String,
      required: true,
    },
    googleMapLink: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    amenities: [
      {
        type: String,
        enum: [
          "parking",
          "restrooms",
          "wifi",
          "cafeteria",
          "locker_room",
          "showers",
          "equipment_rental",
          "lighting",
          "first_aid",
        ],
      },
    ],
    courts: [
      {
        name: { type: String, required: true },
        perHourPrice: { type: Number, required: true },
      },
    ],
    photos: [
      {
        type: String,
        required: [true, "At least one photo is required"],
      },
    ],
    sports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport",
      },
    ],
    openingHours: {
      monday: {
        open: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        close: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      tuesday: {
        open: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        close: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      wednesday: {
        open: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        close: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      thursday: {
        open: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        close: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      friday: {
        open: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        close: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      saturday: {
        open: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        close: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      sunday: {
        open: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        close: {
          type: String,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      _24hours: { type: Boolean, default: false },
    },

    banInfo: {
      isBanned: { type: Boolean, default: false },
      reason: { type: String, maxlength: 500 },
      bannedAt: Date,
      bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: { type: Boolean, default: false },
    venueType: {
      type: String,
      enum: ["indoor", "outdoor", "all"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ratings virtual relation
venueSchema.virtual("ratings", {
  ref: "Rating",
  localField: "_id",
  foreignField: "venue",
});

// Average rating virtual
venueSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const total = this.ratings.reduce((acc, r) => acc + r.score, 0);
  return Math.round((total / this.ratings.length) * 10) / 10; // one decimal
});

// Indexes
venueSchema.index({ name: "text", description: "text" });
venueSchema.index({ owner: 1 });
venueSchema.index({ sports: 1 });
venueSchema.index({ status: 1 });

// Avoid model overwrite error by checking if model is already compiled
module.exports = mongoose.models.Venue || mongoose.model("Venue", venueSchema);
