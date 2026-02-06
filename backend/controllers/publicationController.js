import Publication from "../models/Publication.js";
import { gridFSBucket } from "../config/gridfs.js";

/* ===============================
   GET ALL PUBLICATIONS
================================ */
export const getPublications = async (req, res) => {
  try {
    const { search, type, domain, fromDate, toDate } = req.query;
    const query = {};
    if (req.user?.role === "user") {
      query.userId = req.user.id;
    }
    if (type) query.type = type;
    if (domain) query.domain = { $regex: domain, $options: "i" };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { authors: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }
    if (fromDate || toDate) {
      query.publishedDate = {};
      if (fromDate) query.publishedDate.$gte = new Date(fromDate);
      if (toDate) query.publishedDate.$lte = new Date(toDate);
    }
    const publications = await Publication.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "_id name email");
    res.json(publications);
  } catch (error) {
    console.error("Get publications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   ADD PUBLICATION WITH PROOF
================================ */
export const addPublication = async (req, res) => {
  try {
    let authors = req.body.authors;

    if (typeof authors === "string") {
      try {
        authors = JSON.parse(authors);
      } catch {
        authors = authors.split(",").map(a => a.trim());
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
            module: "publications",
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

    const publication = new Publication({
      ...req.body,
      authors,
      proofFileId,
      userId: req.user?.id,
    });

    await publication.save();
    res.status(201).json(publication);
  } catch (error) {
    console.error("Add publication error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
