import Scholar from "../models/Scholar.js";
import { gridFSBucket } from "../config/gridfs.js";

/**
 * GET all scholars with optional filters
 * Filters: search (name/guide), domain, progress, guide, date range
 */
export const getScholars = async (req, res) => {
  try {
    const { search, domain, progress, guide, fromDate, toDate } = req.query;
    const query = {};
    if (req.user?.role === "user") {
      query.userId = req.user.id;
    }

    // Search filter (scholarName or guide)
    if (search) {
      query.$or = [
        { scholarName: { $regex: search, $options: "i" } },
        { guide: { $regex: search, $options: "i" } },
      ];
    }

    // Domain filter
    if (domain) query.domain = domain;

    // Progress filter
    if (progress) query.progress = progress;

    // Guide filter
    if (guide) query.guide = guide;

    // Date range filter
    if (fromDate || toDate) {
      query.dateOfJoining = {};
      if (fromDate) query.dateOfJoining.$gte = new Date(fromDate);
      if (toDate) query.dateOfJoining.$lte = new Date(toDate);
    }

    const scholars = await Scholar.find(query)
      .sort({ dateOfJoining: -1 })
      .populate("userId", "_id name email");

    res.status(200).json(scholars);
  } catch (err) {
    console.error("Error fetching scholars:", err);
    res.status(500).json({ message: "Failed to fetch scholars", error: err.message });
  }
};

/**
 * GET scholar by ID
 */
export const getScholarById = async (req, res) => {
  try {
    const scholar = await Scholar.findById(req.params.id);
    if (!scholar) return res.status(404).json({ message: "Scholar not found" });
    res.json(scholar);
  } catch (err) {
    console.error("Error fetching scholar:", err);
    res.status(500).json({ message: "Failed to fetch scholar", error: err.message });
  }
};

/**
 * ADD new scholar
 */
export const addScholar = async (req, res) => {
  try {
    const { scholarName, dateOfJoining, domain, progress, guide } = req.body;
    let proofFileId = null;
    if (req.file) {
      const uploadStream = gridFSBucket.openUploadStream(
        `${Date.now()}-${req.file.originalname}`,
        {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: req.user?.id || null,
            module: "scholars",
          },
        }
      );
      const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", reject);
      });
      uploadStream.end(req.file.buffer);
      proofFileId = await uploadPromise;
    }

    if (!scholarName || !dateOfJoining || !domain || !guide) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const scholar = new Scholar({
      scholarName,
      dateOfJoining,
      domain,
      progress,
      guide,
      proofFileId,
      userId: req.user?.id,
    });

    await scholar.save();
    res.status(201).json({ message: "Scholar added successfully", scholar });
  } catch (err) {
    console.error("Error adding scholar:", err);
    res.status(500).json({ message: "Failed to save scholar", error: err.message });
  }
};

/**
 * UPDATE scholar
 */
export const updateScholar = async (req, res) => {
  try {
    const { scholarName, dateOfJoining, domain, progress, guide } = req.body;
    const updatedData = { scholarName, dateOfJoining, domain, progress, guide };
    if (req.file) {
      const uploadStream = gridFSBucket.openUploadStream(
        `${Date.now()}-${req.file.originalname}`,
        {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: req.user?.id || null,
            module: "scholars",
          },
        }
      );
      const uploadPromise = new Promise((resolve, reject) => {
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", reject);
      });
      uploadStream.end(req.file.buffer);
      updatedData.proofFileId = await uploadPromise;
    }

    const scholar = await Scholar.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!scholar) return res.status(404).json({ message: "Scholar not found" });

    res.json({ message: "Scholar updated successfully", scholar });
  } catch (err) {
    console.error("Error updating scholar:", err);
    res.status(500).json({ message: "Failed to update scholar", error: err.message });
  }
};

/**
 * DELETE scholar
 */
export const deleteScholar = async (req, res) => {
  try {
    const deleted = await Scholar.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Scholar not found" });

    res.json({ message: "Scholar deleted successfully" });
  } catch (err) {
    console.error("Error deleting scholar:", err);
    res.status(500).json({ message: "Failed to delete scholar", error: err.message });
  }
};
