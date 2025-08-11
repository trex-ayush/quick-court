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
} = require("../controllers/user");
const { protectedUser } = require("../middleware/auth");
const router = express.Router();

router.post("/register", sendRegistrationOTP);
router.post("/verify-otp", verifyRegistrationOTP);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.put("/me/update", protectedUser, updateMyProfile);

// for admin
router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.post("/", createUser);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

module.exports = router;
