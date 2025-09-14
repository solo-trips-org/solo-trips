import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Token } from "../models/token.model.js";
import OTP from "../models/otp.model.js";
import otpGenerator from "otp-generator";
import { sendOtpEmail } from "../../libs/mailUtil.js";

const createToken = async (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await Token.create({ userId: user._id, token, expiresAt });

  return token;
};

const checkLimitOTP = async (email, type, limit) => {
  const last24hrs = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const otpCount = await OTP.countDocuments({
    email,
    type,
    createdAt: { $gte: last24hrs },
  });

  if (otpCount >= limit) {
    throw new Error(
      `OTP limit of ${limit} reached. Please try again after 24 hours.`
    );
  }
};

export const register = async (req, res) => {
  try {
    const { username, phone, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, Email , Password are Required",
      });
    }
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      username,
      email,
      phone,
      password,
      role: "user",
    });
    const token = await createToken(user);

    res
      .status(201)
      .json({ success: true, message: "User Registered Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Register failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res
        .status(400)
        .json({ message: "Username/email and password are required" });
    }

    // Build dynamic query: prefer email if given, else username
    const query = email ? { email } : { username };

    const user = await User.findOne(query);
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(400)
        .json({ message: "Invalid username/email or password" });
    }

    const token = await createToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const profile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ user });
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(400).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  await Token.deleteOne({ token });

  res.json({ message: "Logged out" });
};

/**
 * Handles login/signup via Firebase ID token (Google login)
 */
export const firebaseAuth = async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;
    const provider = decodedToken.firebase?.sign_in_provider ?? "unknown";

    let user = await User.findOne({ oauthUuid: uid });

    if (!user) {
      const [firstName, ...lastName] = name?.split(" ") ?? ["", ""];
      user = await User.create({
        oauthUuid: uid,
        email,
        provider,
        role: "customer",
      });
    }

    // Generate JWT token for your app sessions
    const token = await createToken(user);

    res.json({ token, user });
  } catch (err) {
    console.error("Firebase auth error:", err);
    res.status(401).json({ error: "Invalid Firebase token" });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User with this mail not found" });
    }

    const limit = parseInt(process.env.OTP_LIMIT || "3", 10);
    await checkLimitOTP(email, type || "forget", limit);

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await OTP.create({
      email,
      otp,
      type: type || "forget",
      expiresAt,
    });

    await sendOtpEmail(user.email, otp, 3);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    if (err.message?.includes("OTP limit")) {
      return res.status(429).json({ success: false, message: err.message });
    }
    res
      .status(500)
      .json({ success: false, message: err.message || "Unexpected error" });
  }
};

export const newOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email",
        });
    }

    const limit = parseInt(process.env.OTP_LIMIT || "3", 10);
    await checkLimitOTP(email, "signup", limit);

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await OTP.create({
      email,
      otp,
      type: "signup",
      expiresAt,
    });

    await sendOtpEmail(email, otp, 3);

    res
      .status(200)
      .json({ success: true, message: "Signup OTP sent successfully" });
  } catch (err) {
    if (err.message?.includes("OTP limit")) {
      return res.status(429).json({ success: false, message: err.message });
    }
    res
      .status(500)
      .json({ success: false, message: err.message || "Unexpected error" });
  }
};

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // check OTP validity
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: "forget",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // update password
    user.password = newPassword;
    await user.save();

    // cleanup OTP (optional for security)
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("ResetPassword Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
