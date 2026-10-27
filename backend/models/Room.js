const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ["single", "double", "deluxe", "suite"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, default: 2, min: 1 },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
    },
    description: { type: String, trim: true },
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);