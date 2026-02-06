import express from "express";
import mongoose from "mongoose";
import { gridFSBucket } from "../config/gridfs.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * 📌 STREAM FILE FROM GRIDFS (ADMIN ONLY)
 * GET /api/files/:id
 */
router.get("/:id", auth, isAdmin, async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const downloadStream = gridFSBucket.openDownloadStream(fileId);

    downloadStream.on("error", () => {
      res.status(404).json({ message: "File not found" });
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("File stream error:", err);
    res.status(400).json({ message: "Invalid file id" });
  }
});

export default router;
