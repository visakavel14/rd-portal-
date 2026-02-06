import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import Publication from "../models/Publication.js";
import IPR from "../models/IPR.js";
import ProjectProposal from "../models/Proposals.js";
import Scholar from "../models/Scholar.js";

const router = express.Router();

// GET /api/users/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email department designation role username"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, ...user.toObject() });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, department, designation } = req.body;
    const update = { name, department, designation };
    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    }).select("name email department designation role username");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, ...user.toObject() });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [publications, proposals, iprs, scholars] = await Promise.all([
      Publication.countDocuments({ userId }),
      ProjectProposal.countDocuments({ userId }),
      IPR.countDocuments({ userId }),
      Scholar.countDocuments({ userId }),
    ]);
    res.json({ publications, proposals, iprs, scholars });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/change-password (admin only)
router.put("/change-password", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing password fields" });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ message: "Invalid password" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
