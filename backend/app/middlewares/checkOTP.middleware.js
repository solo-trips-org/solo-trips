import OTP from "../models/otp.model.js";

export const checkOTP = async (req, res, next) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // find latest OTP for this email & type
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: type || "general",
      expiresAt: { $gt: new Date() }, // must not be expired
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // attach to request for next controller use
    req.otpRecord = otpRecord;

    next();
  } catch (err) {
    console.error("checkOTP Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
