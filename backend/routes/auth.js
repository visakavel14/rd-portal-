import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const normalizedEmail = (email || "").toLowerCase().trim();
  const allowedDomains = ["@student.tce.edu", "@tce.edu"];
  const isAllowedDomain = allowedDomains.some((domain) =>
    normalizedEmail.endsWith(domain)
  );

  if (!isAllowedDomain) {
    return res
      .status(400)
      .json({ message: "Use @student.tce.edu or @tce.edu email" });
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return res.status(400).json({ message: "User exists" });

  await User.create({ username, email: normalizedEmail, password });
  res.json({ message: "Registered successfully" });
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
    },
  });
});

/* CURRENT USER */
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

/* CHANGE PASSWORD */
router.put("/change-password", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.password = req.body.password;
  await user.save();
  res.json({ message: "Password updated" });
});

export default router;
