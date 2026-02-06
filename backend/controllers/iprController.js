// backend/controllers/iprController.js

import IPR from "../models/IPR.js";
import { gridFSBucket } from "../config/gridfs.js";

/* ----------------------------------------------------------
   GET ALL IPRS (WITH FILTERS)
----------------------------------------------------------- */
export const getIPRs = async (req, res) => {
  try {
    const { type, status, domain, search } = req.query;

    let filter = {};
    if (req.user?.role === "user") {
      filter.userId = req.user.id;
    }

    // ------------------- Filtering Logic -------------------
    if (type) filter.type = type;
    if (status) filter.status = status;

    if (domain) {
      filter.domain = { $regex: domain, $options: "i" };
    }

    // Search text across title, patent, domain, holders
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { patentNumber: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
        { holders: { $elemMatch: { $regex: search, $options: "i" } } }
      ];
    }

    const iprs = await IPR.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "_id name email");

    res.json(iprs);
  } catch (err) {
    console.error("GET IPR Error:", err);
    res.status(500).json({ message: "Failed to fetch IPRs" });
  }
};

/* ----------------------------------------------------------
   GET SINGLE IPR
----------------------------------------------------------- */
export const getIPRById = async (req, res) => {
  try {
    const ipr = await IPR.findById(req.params.id);

    if (!ipr) {
      return res.status(404).json({ message: "IPR not found" });
    }

    res.json(ipr);
  } catch (err) {
    console.error("GET IPR BY ID Error:", err);
    res.status(500).json({ message: "Failed to fetch IPR" });
  }
};

/* ----------------------------------------------------------
   ADD NEW IPR
----------------------------------------------------------- */
export const addIPR = async (req, res) => {
  try {
    const data = { ...req.body };

    // Convert holders JSON string → array
    if (data.holders) {
      try {
        data.holders = JSON.parse(data.holders);
      } catch {
        data.holders = [];
      }
    }

    // File upload
    if (req.file) {
      const uploadStream = gridFSBucket.openUploadStream(
        `${Date.now()}-${req.file.originalname}`,
        {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: req.user?.id || null,
            module: "ipr",
          },
        }
      );
      const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", reject);
      });
      uploadStream.end(req.file.buffer);
      data.proofFileId = await uploadPromise;
    }
    data.userId = req.user?.id;

    const ipr = new IPR(data);
    await ipr.save();

    res.status(201).json(ipr);
  } catch (err) {
    console.error("Add IPR Error:", err);
    res.status(500).json({
      message: "Failed to save IPR",
      error: err.message
    });
  }
};

/* ----------------------------------------------------------
   UPDATE IPR
----------------------------------------------------------- */
export const updateIPR = async (req, res) => {
  try {
    const data = { ...req.body };

    // Convert holders JSON string → array
    if (data.holders) {
      try {
        data.holders = JSON.parse(data.holders);
      } catch {
        data.holders = [];
      }
    }

    // File upload (only replace if new file uploaded)
    if (req.file) {
      const uploadStream = gridFSBucket.openUploadStream(
        `${Date.now()}-${req.file.originalname}`,
        {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: req.user?.id || null,
            module: "ipr",
          },
        }
      );
      const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", reject);
      });
      uploadStream.end(req.file.buffer);
      data.proofFileId = await uploadPromise;
    }

    const updated = await IPR.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "IPR not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update IPR Error:", err);
    res.status(500).json({
      message: "Failed to update IPR",
      error: err.message,
    });
  }
};

/* ----------------------------------------------------------
   DELETE IPR
----------------------------------------------------------- */
export const deleteIPR = async (req, res) => {
  try {
    const deleted = await IPR.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "IPR not found" });
    }

    res.json({ message: "IPR deleted successfully" });
  } catch (err) {
    console.error("Delete IPR Error:", err);
    res.status(500).json({
      message: "Failed to delete IPR",
      error: err.message,
    });
  }
};
