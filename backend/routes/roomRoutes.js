const express = require("express");
const Room = require("../models/Room");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all rooms (anyone)
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one room (anyone)
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: "Invalid room id" });
  }
});

// Add a room (admin only)
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Room number already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// Update a room (admin only)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a room (admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(400).json({ message: "Invalid room id" });
  }
});

module.exports = router;