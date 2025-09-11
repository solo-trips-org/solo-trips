import OTP  from '../models/otp.model.js';


export const checkOTP = async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) {
        return res.status(400).json({ message: 'OTP is required' });
    }

    // Assuming we have a function to validate OTP
    const otpRecord = await OTP.findOne({ otp, expiresAt: { $gt: new Date() } });

    if (!otpRecord) {
      return res.status(404).json({ error: "Invalid OTP" });
    }

    next();
}