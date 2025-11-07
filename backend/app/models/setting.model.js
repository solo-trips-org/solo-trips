import mongoose from "mongoose";

const settingsSchema = mongoose.Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true },
});

const Setting = mongoose.model("Setting", settingsSchema);
export default Setting;