const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "Your account is banned" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Not authorized" });
  }
};

// Specific role-based protections
exports.protectedUser = [
  verifyToken,
  (req, res, next) => {
    const role = req.user.role;
    if (role !== "player" && role !== "admin" && role !== "owner") {
      return res
        .status(403)
        .json({
          error: "Only players, owners or admins can access this route",
        });
    }
    next();
  },
];

exports.protectedOwner = [
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "owner" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only venue owners or admins can access this route" });
    }
    next();
  },
];

exports.protectedAdmin = [
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can access this route" });
    }
    next();
  },
];
