import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Token } from '../models/token.model.js';
import OTP from '../models/otp.model.js';
import otpGenerator from 'otp-generator';
import { sendOtpEmail } from '../../libs/mailUtil.js';

const createToken = async (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await Token.create({ userId: user._id, token, expiresAt });

  return token;
};

export const register = async (req, res) => {
  try {
    const { username, phone , email , password } = req.body;
    if(!username || !email || !password){
      return res.status(400).json({success: false, message: "Username, Email , Password are Required"});
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({ username, email, phone, password,role: "user" });
    const token = await createToken(user);

    res.status(201).json({ success: true, message: "User Registered Successfully" });
  } catch (err) {
    res.status(500).json({ message: 'Register failed', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    // Build dynamic query: prefer email if given, else username
    const query = email ? { email } : { username };

    const user = await User.findOne(query);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid username/email or password" });
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
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(400).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  await Token.deleteOne({ token });

  res.json({ message: 'Logged out' });
};

/**
 * Handles login/signup via Firebase ID token (Google login)
 */
export const firebaseAuth = async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;
    const provider = decodedToken.firebase?.sign_in_provider ?? 'unknown';

    let user = await User.findOne({ oauthUuid: uid });

    if (!user) {
      const [firstName, ...lastName] = name?.split(' ') ?? ['', ''];
      user = await User.create({
        oauthUuid: uid,
        email,
        provider,
        role: 'customer'
      });
    }

    // Generate JWT token for your app sessions
    const token = await createToken(user);

    res.json({ token, user });

  } catch (err) {
    console.error('Firebase auth error:', err);
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
      });
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now
      await OTP.create({"email": email, "otp": otp, "expiresAt": expiresAt })
      await sendOtpEmail(user.email, otp, 3);
      res.status(200).json({ "success": true });
      
  } catch (err) {
    console.error('Email Error:', err); // logs full error to server console

    res.status(500).json({
      error: err.message || 'Unexpected error occurred while sending email',
      code: err.code || null
    });
  }
}

export const newOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
      if (!user) {
        const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
      });
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now
      await OTP.create({"email": email, "otp": otp, "expiresAt": expiresAt })
      await sendOtpEmail(email, otp, 3);
      res.status(200).json({ "success": true });
      }else{
        res.status(500).json({error: "User already exists with this email"})
      }
      
      
  } catch (err) {
    console.error('Email Error:', err); // logs full error to server console

    res.status(500).json({
      error: err.message || 'Unexpected error occurred while sending email',
      code: err.code || null
    });
  }
}

export const forgetPassword = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const otpRecord = await OTP.findOne({ otp, email, expiresAt: { $gt: new Date() } });

    if (!otpRecord) {
      return res.status(404).json({ error: "Invalid OTP" });
    }

    const user = await User.findOne({email: otpRecord.email});

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const token = await createToken(user, 'reset');
    res.status(200).json({ "success": true, "token": token });

  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const tokenDoc = await Token.findOne({ token });
  if (!tokenDoc) {
    return res.status(404).json({ error: "Token not found" });
  }
  const updatedUser = await User.findByIdAndUpdate(tokenDoc.userId, { password }, { new: true });
  await Token.findByIdAndDelete(tokenDoc._id);
  res.status(200).json({ "data": updatedUser });
};