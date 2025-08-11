const User = require("../models/user");
const {
  generateOTP,
  sendOTPEmail,
  generateRandomToken,
  generateJWT,
  hashPassword,
  comparePassword,
} = require("../utils/helper");
require("dotenv").config();

const otpStore = {}; // Temporary in-memory OTP store

// Send OTP for registration
exports.sendRegistrationOTP = async (req, res) => {
  try {
    const { name, email, password, phone, role, adminKey } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    if (!["player", "owner", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role selected" });
    }

    // If admin role, verify admin key
    if (role === "admin") {
      if (!adminKey) {
        return res
          .status(400)
          .json({ success: false, message: "Admin key is required" });
      }
      if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid admin key" });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const otp = generateOTP();

    // Store OTP temporarily in memory
    otpStore[email] = {
      otp,
      name,
      email,
      password,
      phone,
      role,
      otpExpiry: Date.now() + 5 * 60 * 1000,
    };

    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email for verification",
    });
  } catch (error) {
    console.error("sendRegistrationOTP Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify OTP and activate account
exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const userData = otpStore[email];
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "OTP not found or expired" });
    }

    if (userData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (userData.otpExpiry < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // OTP is valid, create user in DB
    const { name, email: userEmail, password, phone, role } = userData;
    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email: userEmail,
      password: hashedPassword,
      phone,
      role,
    });

    delete otpStore[email]; // Clean up after verification

    res.status(200).json({
      success: true,
      message: "Account verified and created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("verifyRegistrationOTP Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.isBanned)
      return res
        .status(403)
        .json({ success: false, message: "Account banned" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateJWT(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user,
    });
  } catch (error) {
    console.error("loginUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout
exports.logoutUser = async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const resetToken = generateRandomToken(20);
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // Email sending can be added here
    res.status(200).json({
      success: true,
      message: "Reset token generated",
      resetToken, // In real app, send via email
    });
  } catch (error) {
    console.error("forgotPassword Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CRUD

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("getAllUsers Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("getUserById Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error("createUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("updateUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("deleteUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    // Extract allowed fields from req.body
    const allowedFields = ["name", "email", "phone"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle profile picture upload
    if (req.file?.path) {
      updates.avatar = req.file.path; // Cloudinary URL
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
