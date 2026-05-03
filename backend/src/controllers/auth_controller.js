import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateAccessToken from "../utils/token/generateAccessToken.js";
import generateRefreshToken from "../utils/token/generateRefreshToken.js";
import { sendVerificationEmail } from "../utils/resendMail.js";
import { validateEmail, validatePassword, validateRequired } from "../utils/validation.js";

// ================= SIGNUP =================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields first (before any DB query)
    if (!validateRequired(name, email, password)) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and contain letters, numbers and special characters (@$!%*#?&)",
      });
    }

    // 2. Check for existing user
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Email already registered. Please login instead." });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Generate a secure email verification token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let user;
    if (existingUser && !existingUser.isVerified) {
      // Re-use the existing unverified account and refresh the token
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.verificationToken = verificationToken;
      existingUser.verificationTokenExpiry = verificationTokenExpiry;
      user = await existingUser.save();
    } else {
      user = new User({
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
      });
      await user.save();
    }

    // 5. Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({ to: email, name, verifyUrl });

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY EMAIL =================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    // Find user with a valid (non-expired) token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link. Please sign up again." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateRequired(email, password)) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Enforce email verification before allowing login
    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Account not verified. Please check your email for the verification link.",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGOUT =================
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.refreshToken = null;
    await user.save();
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REFRESH ACCESS TOKEN =================
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify the refresh token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Validate the token matches what's stored in the DB (prevents reuse after logout)
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      return res.status(401).json({ message: "Refresh token not recognized or already revoked" });
    }

    // Token rotation: issue both new tokens on every refresh
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name.trim();

    if (password) {
      if (!validatePassword(password)) {
        return res.status(400).json({
          message: "Password must contain letters, numbers and special characters",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({
      message: "User updated successfully",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE USER =================
const deleteUser = async (req, res) => {
  try {
    // Fixed: was using deprecated document.remove() — now uses findByIdAndDelete()
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL USERS (Admin/Testing) =================
const allUsers = async (req, res) => {
  try {
    // Exclude sensitive fields from response
    const users = await User.find({}, { password: 0, refreshToken: 0, verificationToken: 0 });
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { signup, login, logout, verifyEmail, refreshAccessToken, allUsers, updateUser, deleteUser };
