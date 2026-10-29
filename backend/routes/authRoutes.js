const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getStudents,
  toggleStudentStatus,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Authenticated user profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Admin-only student management routes
router.get("/students", protect, adminOnly, getStudents);
router.put("/students/:id/status", protect, adminOnly, toggleStudentStatus);

module.exports = router;
