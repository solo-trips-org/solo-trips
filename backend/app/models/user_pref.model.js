import mongoose from "mongoose";

const userPrefSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  key: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true },
});

const UserPref = mongoose.model("UserPref", userPrefSchema);
export default UserPref;
