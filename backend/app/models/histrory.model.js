import mongoose from "mongoose";

const historySchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

const History = mongoose.model("History", historySchema);
export default History;
