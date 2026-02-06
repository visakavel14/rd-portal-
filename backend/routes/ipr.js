// routes/ipr.js

import express from 'express';
import { upload } from "../middleware/gridfsUpload.js";
import { getIPRs, getIPRById, addIPR, updateIPR, deleteIPR } from '../controllers/iprController.js';
import { auth } from "../middleware/auth.js";

const router = express.Router();

// -------------------- MULTER CONFIG --------------------
// -------------------- ROUTES --------------------

// Get all IPRs
router.get('/', auth, getIPRs);

// Get single IPR by ID
router.get('/:id', auth, getIPRById);

// Add new IPR with optional file upload
router.post('/', auth, upload.single('proof'), addIPR);

// Update existing IPR by ID with optional file upload
router.put('/:id', auth, upload.single('proof'), updateIPR);

// Delete IPR by ID
router.delete('/:id', auth, deleteIPR);

export default router;
