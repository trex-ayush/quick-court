const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  updateMyProfile,
  getMe,
  toggleBanUser,
  getAdminStats,
} = require("../controllers/user");
const { protectedUser, protectedAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/register", sendRegistrationOTP);
router.post("/verify-otp", verifyRegistrationOTP);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.get("/me", protectedUser, getMe);
router.put(
  "/me/update",
  protectedUser,
  upload.single("profilePhoto"),
  updateMyProfile
);

// for admin
router.get("/", protectedAdmin, getAllUsers);
router.get("/stats/admin", protectedAdmin, getAdminStats);
router.post("/", protectedAdmin, createUser);
router.get("/:userId", protectedAdmin, getUserById);
router.put("/:userId", protectedAdmin, updateUser);
router.delete("/:userId", protectedAdmin, deleteUser);
router.post("/:userId/toggle-ban", protectedAdmin, toggleBanUser);

module.exports = router;
