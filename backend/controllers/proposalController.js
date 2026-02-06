import ProjectProposal from "../models/Proposals.js"; // ensure filename matches your model
import { gridFSBucket } from "../config/gridfs.js";

/**
 * GET all proposals (with search, domain, status & date filters)
 */
export const getProposals = async (req, res) => {
  try {
    const { search, domain, status, startDate, endDate } = req.query;
    const query = {};
    if (req.user?.role === "user") {
      query.userId = req.user.id;
    }

    // Search filter (title, agency, PI)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { agency: { $regex: search, $options: "i" } },
        { pi: { $regex: search, $options: "i" } },
      ];
    }

    // Domain filter
    if (domain) query.domain = domain;

    // Status filter
    if (status) query.status = status;

    // Date filter: filter proposals between startDate and endDate
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Fetch proposals sorted by creation date, populate user info
    const proposals = await ProjectProposal.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "_id name email");

    res.status(200).json(proposals);
  } catch (err) {
    console.error("Error fetching proposals:", err);
    res.status(500).json({ message: "Failed to fetch proposals", error: err.message });
  }
};

/**
 * ADD new proposal
 */
export const addProposal = async (req, res) => {
  try {
    const { title, domain, agency, pi, copi, date, status } = req.body;

    if (!title || !domain || !agency) {
      return res.status(400).json({ message: "Title, Domain, and Agency are required" });
    }

    let coPis = [];
    if (copi) {
      try {
        coPis = typeof copi === "string" ? JSON.parse(copi) : copi;
      } catch {
        coPis = copi.split(",").map((c) => c.trim()).filter(Boolean);
      }
    }

    let proofFileId = null;
    if (req.file) {
      const uploadStream = gridFSBucket.openUploadStream(
        `${Date.now()}-${req.file.originalname}`,
        {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: req.user?.id || null,
            module: "proposals",
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

    const proposal = new ProjectProposal({
      title,
      domain,
      agency,
      pi,
      copi: coPis,
      status: status || "submitted",
      date: date || undefined, // store date
      proofFileId,
      userId: req.user?.id,
    });

    await proposal.save();
    res.status(201).json({ message: "Proposal added successfully", proposal });
  } catch (err) {
    console.error("Error adding proposal:", err);
    res.status(500).json({ message: "Failed to add proposal", error: err.message });
  }
};

/**
 * UPDATE proposal
 */
export const updateProposal = async (req, res) => {
  try {
    const data = { ...req.body };

    // Parse Co-PI array
    if (data.copi) {
      try {
        data.copi = typeof data.copi === "string" ? JSON.parse(data.copi) : data.copi;
      } catch {
        data.copi = data.copi.split(",").map((c) => c.trim()).filter(Boolean);
      }
    }

    // Update proof file if uploaded
    if (req.file) {
      const uploadStream = gridFSBucket.openUploadStream(
        `${Date.now()}-${req.file.originalname}`,
        {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: req.user?.id || null,
            module: "proposals",
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

    const proposal = await ProjectProposal.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    res.json({ message: "Proposal updated successfully", proposal });
  } catch (err) {
    console.error("Error updating proposal:", err);
    res.status(500).json({ message: "Failed to update proposal", error: err.message });
  }
};

/**
 * DELETE proposal
 */
export const deleteProposal = async (req, res) => {
  try {
    const deleted = await ProjectProposal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Proposal not found" });

    res.json({ message: "Proposal deleted successfully" });
  } catch (err) {
    console.error("Error deleting proposal:", err);
    res.status(500).json({ message: "Failed to delete proposal", error: err.message });
  }
};
