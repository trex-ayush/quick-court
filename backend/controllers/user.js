const User = require("../models/user");
const {
  generateOTP,
  sendOTPEmail,
  hashPassword,
} = require("../utils/helper");

const crypto = require("crypto");

// Store OTP temporarily in memory (You can replace this with Redis or a database for production)
let otpStore = {};

// Send OTP for registration
exports.sendRegistrationOTP = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const otp = generateOTP();

    // Store OTP in memory temporarily
    otpStore[email] = { otp, name, email, password, phone, otpExpiry: Date.now() + 5 * 60 * 1000 };

    await sendOTPEmail(email, otp);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("sendRegistrationOTP Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify OTP and activate account
exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists for the given email
    const userData = otpStore[email];
    if (!userData) return res.status(404).json({ success: false, message: "OTP not found or expired" });

    if (userData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (userData.otpExpiry < Date.now()) {
      // OTP expired
      delete otpStore[email]; // Clean up the expired OTP
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // OTP is valid, now create user in the database
    const { name, email: userEmail, password, phone } = userData;
    const hashedPassword = await hashPassword(password);

    // Create the user in DB
    const newUser = await User.create({
      name,
      email: userEmail,
      password: hashedPassword,
      phone,
    });

    // Clear OTP from memory after successful verification and user creation
    delete otpStore[email];

    res.status(200).json({ success: true, message: "Account verified and created successfully", user: newUser });
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
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isBanned) return res.status(403).json({ success: false, message: "Account banned" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = generateJWT(user._id);

    res.status(200).json({ success: true, token, user });
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
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = generateRandomToken(20);
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

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
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

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
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

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
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("deleteUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
