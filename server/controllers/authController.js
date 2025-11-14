import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { encryptText, decryptText } from "../utils/crypto.js";
import { sendVerificationOTP, generateOTP } from "../utils/emailService.js";

const SALT_ROUNDS = 10;
const JWT_EXPIRES = "7d";
const OTP_EXPIRY_MINUTES = 10;

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, phone, avatar } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check duplicates
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "Email or username already in use" });

    // Hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Encrypt phone if provided
    const encryptedPhone = phone ? encryptText(phone) : null;

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + OTP_EXPIRY_MINUTES);

    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      password: hashed,
      phone: encryptedPhone,
      avatar: avatar || null,
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: otpExpiry,
      isEmailVerified: false
    });

    const emailSent = await sendVerificationOTP(email, otp);
    if (!emailSent) {
      console.error("Failed to send verification email");
    }

    const token = jwt.sign({ id: user._id, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ 
      message: "User created. Please verify your email.", 
      userId: user._id,
      requiresVerification: true
    });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email before logging in",
        requiresVerification: true
      });
    }

    const token = jwt.sign({ id: user._id, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  return res.json({ message: "Logged out" });
};

export const me = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(id).select("-password -__v -emailVerificationOTP");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userObj = user.toObject();
    // Decrypt phone if present
    userObj.phone = userObj.phone ? decryptText(userObj.phone) : null;

    return res.json({ user: userObj });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified) {
      return res.json({ message: "Email already verified" });
    }

    if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.emailVerificationOTPExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpiry = null;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified) {
      return res.json({ message: "Email already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + OTP_EXPIRY_MINUTES);

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = otpExpiry;
    await user.save();

    const emailSent = await sendVerificationOTP(user.email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email" });
    }

    return res.json({ message: "Verification OTP sent to your email" });
  } catch (err) {
    console.error("resendOTP error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
