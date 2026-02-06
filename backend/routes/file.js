import express from "express";
import mongoose from "mongoose";
import { gridfsBucket } from "../config/gridfs.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ===============================
   GET FILE BY ID
================================ */
router.get("/:id", auth, async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const files = await gridfsBucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.set("Content-Type", files[0].contentType);
    res.set("Content-Disposition", `inline; filename="${files[0].filename}"`);

    gridfsBucket.openDownloadStream(fileId).pipe(res);
  } catch (error) {
    console.error("File fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
