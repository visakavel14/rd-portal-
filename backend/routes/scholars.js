import express from 'express';
import { upload } from "../middleware/gridfsUpload.js";
import {
  getScholars,
  getScholarById,
  addScholar,
  updateScholar,
  deleteScholar
} from '../controllers/scholarController.js';
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Multer setup
// Routes
router.get('/', auth, getScholars);
router.get('/:id', auth, getScholarById);
router.post('/', auth, upload.single('proof'), addScholar);
router.put('/:id', auth, upload.single('proof'), updateScholar);
router.delete('/:id', auth, deleteScholar);

export default router;
