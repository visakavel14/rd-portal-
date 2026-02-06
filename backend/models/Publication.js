import mongoose from "mongoose";

const PublicationSchema = new mongoose.Schema({
  title: String,
  type: String,
  domain: String,
  publishedDate: Date,
  authors: [String],

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  proofFileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
});

export default mongoose.model("Publication", PublicationSchema);
