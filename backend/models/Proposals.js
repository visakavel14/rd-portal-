// models/ProjectProposal.js

import mongoose from 'mongoose';

const ProjectProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'granted'],
      default: 'submitted',
    },
    agency: {
      type: String,
      required: true,
      trim: true,
    },
    pi: {
      type: String,
      trim: true,
    },
    copi: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
    },
    proof: {
      type: String, // stores the filename of uploaded PDF/image
    },
    proofFileId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference to the User collection
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt fields
);

export default mongoose.model('ProjectProposal', ProjectProposalSchema);
