import mongoose from 'mongoose';

const ScholarSchema = new mongoose.Schema({
  scholarName: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  domain: { type: String },
  progress: { type: String },
  guide: { type: String },
  proof: { type: String }, // filename of uploaded proof
  proofFileId: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model('Scholar', ScholarSchema);
