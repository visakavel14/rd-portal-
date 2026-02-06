import express from 'express';
import { upload } from "../middleware/gridfsUpload.js";
import {
  getProposals,
  addProposal,
  updateProposal,
  deleteProposal,
} from '../controllers/proposalController.js';
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Multer config for file upload
// Routes
router.get('/', auth, getProposals);
router.post('/', auth, upload.single('proof'), addProposal);
router.put('/:id', auth, upload.single('proof'), updateProposal);
router.delete('/:id', auth, deleteProposal);

export default router;
