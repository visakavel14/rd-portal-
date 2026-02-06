import mongoose from 'mongoose';

const IPRSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'utility' or 'design'
  status: { type: String, default: 'submitted' },
  title: { type: String, required: true },
  holders: [{ type: String }],
  domain: { type: String },
  submissionDate: { type: Date },
  patentNumber: { type: String }, // utility-specific
  designNumber: { type: String }, // design-specific
  proof: { type: String },
  proofFileId: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model('IPR', IPRSchema);
