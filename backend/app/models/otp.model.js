import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["signup","forget","confirm"],
        default: "signup"
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;