const express = require("express");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a booking (any logged-in user)
router.post("/", protect, async (req, res) => {
  try {
    const { room: roomId, checkIn, checkOut, guests } = req.body;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid dates" });
    }
    if (end <= start) {
      return res
        .status(400)
        .json({ message: "Check-out must be after check-in" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.status === "maintenance") {
      return res.status(400).json({ message: "Room is under maintenance" });
    }
    if (guests && guests > room.capacity) {
      return res
        .status(400)
        .json({ message: "Too many guests for this room" });
    }

    const clash = await Booking.findOne({
      room: roomId,
      status: { $in: ["confirmed", "checked-in"] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });
    if (clash) {
      return res
        .status(400)
        .json({ message: "Room is already booked for these dates" });
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.price;

    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkIn: start,
      checkOut: end,
      guests: guests || 1,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// My bookings (logged-in user)
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All bookings (admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel a booking (owner or admin)
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: "Only confirmed bookings can be cancelled" });
    }

    booking.status = "cancelled";
    if (booking.paymentStatus === "paid") booking.paymentStatus = "refunded";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: "Invalid booking id" });
  }
});

// Pay for a booking (owner only, simulated payment)
router.put("/:id/pay", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is cancelled" });
    }
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    booking.paymentStatus = "paid";
    booking.paymentMethod = (req.body && req.body.method) || "card";
    booking.transactionId = "TXN" + Date.now();
    booking.paidAt = new Date();
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: "Invalid booking id" });
  }
});

// Check-in (admin only)
router.put("/:id/checkin", protect, authorize("admin"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: "Only confirmed bookings can be checked in" });
    }

    booking.status = "checked-in";
    booking.actualCheckIn = new Date();
    await booking.save();
    await Room.findByIdAndUpdate(booking.room, { status: "booked" });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: "Invalid booking id" });
  }
});

// Check-out (admin only)
router.put("/:id/checkout", protect, authorize("admin"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "checked-in") {
      return res.status(400).json({ message: "Guest is not checked in" });
    }
    if (booking.paymentStatus !== "paid") {
      return res
        .status(400)
        .json({ message: "Payment pending. Collect payment before check-out" });
    }

    booking.status = "checked-out";
    booking.actualCheckOut = new Date();
    await booking.save();
    await Room.findByIdAndUpdate(booking.room, { status: "available" });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: "Invalid booking id" });
  }
});

module.exports = router;