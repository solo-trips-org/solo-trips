import Setting from "../models/setting.model.js";

export const getGlobalSettings = async (res, req) => {
  try {
    const settings = await Setting.find();
    res.status(200).json({ success: true, data: settings });
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateGlobalSetting = async (res, req) => {
  const { key } = req.params;
  const { value } = req.body;
  const data = await Setting.findOneAndUpdate(
    { key },
    { value: value },
    { new: true }
  );
  return res.status(203).json({ data });
};

export const getOneGlobalSetting = async (res, req) => {
  const { key } = req.params;
  const data = await Setting.findOne({ key });
  return res.status(200).json({ data });
};