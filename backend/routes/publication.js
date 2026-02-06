import express from "express";
import { upload } from "../middleware/gridfsUpload.js";
import {
  getPublications,
  addPublication,
} from "../controllers/publicationController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getPublications);
router.post("/", auth, upload.single("proof"), addPublication);

export default router;
