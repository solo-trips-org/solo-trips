import Setting from "../models/setting.model.js";

// Get all settings
export const getGlobalSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a setting by key
export const updateGlobalSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const data = await Setting.findOneAndUpdate(
      { key },
      { value },
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ error: "Setting not found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get one setting by key
export const getOneGlobalSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const data = await Setting.findOne({ key });

    if (!data) {
      return res.status(404).json({ error: "Setting not found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
