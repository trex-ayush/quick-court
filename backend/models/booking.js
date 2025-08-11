const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a user"],
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: [true, "Booking must belong to a venue"],
    },
    court: {
      type: String,
      required: true,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: [true, "Booking must specify a sport"],
    },
    date: {
      type: Date,
      required: [true, "Booking date is required"],
      validate: {
        validator: function (v) {
          return v >= new Date().setHours(0, 0, 0, 0);
        },
        message: "Booking date cannot be in the past",
      },
    },
    timeSlot: {
      start: {
        type: String,
        required: true,
        match: [
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Invalid time format (HH:MM)",
        ],
      },
      end: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return this.timeSlot.start < v;
          },
          message: "End time must be after start time",
        },
      },
    },
    duration: {
      type: Number,
      default: function () {
        const [startH, startM] = this.timeSlot.start.split(":").map(Number);
        const [endH, endM] = this.timeSlot.end.split(":").map(Number);
        return endH * 60 + endM - (startH * 60 + startM);
      },
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price must be calculated"],
      min: [0, "Price cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed", "no-show"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ venue: 1 });
bookingSchema.index({ court: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ "timeSlot.start": 1, "timeSlot.end": 1 });

// Prevent double bookings
bookingSchema.index(
  {
    court: 1,
    date: 1,
    "timeSlot.start": 1,
    "timeSlot.end": 1,
  },
  { unique: true }
);

// Virtual for checking if booking is active
bookingSchema.virtual("isActive").get(function () {
  return (
    this.status === "confirmed" &&
    new Date(this.date) >= new Date().setHours(0, 0, 0, 0)
  );
});

// Auto-populate references
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user venue court sport participants",
    select: "-__v -password -resetToken -otp",
  });
  next();
});

// Validate court availability before saving
bookingSchema.pre("save", async function (next) {
  const conflictingBooking = await mongoose.model("Booking").findOne({
    court: this.court,
    date: this.date,
    "timeSlot.start": { $lt: this.timeSlot.end },
    "timeSlot.end": { $gt: this.timeSlot.start },
    _id: { $ne: this._id }, // Exclude current booking for updates
  });

  if (conflictingBooking) {
    throw new Error("This time slot is already booked for the selected court");
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
