const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");

const {
  createPublication,
  getPublications,
  updatePublication,
  deletePublication
} = require("../controllers/publicationController");

// CREATE (with file upload)
router.post("/", authenticate, upload.single("proof"), createPublication);

// GET all (filters supported)
router.get("/", authenticate, getPublications);

// UPDATE (with file upload)
router.put("/:id", authenticate, upload.single("proof"), updatePublication);

// DELETE
router.delete("/:id", authenticate, deletePublication);

module.exports = router;
