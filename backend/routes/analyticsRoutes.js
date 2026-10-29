const express = require("express");
const {
  getDashboardStats,
  getPopularBooks,
  getCategoryStats,
  getPublicOverview,
} = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public analytics for landing page & catalog
router.get("/public", getPublicOverview);
router.get("/popular", getPopularBooks);
router.get("/categories", getCategoryStats);

// Protected admin dashboard analytics
router.get("/stats", protect, adminOnly, getDashboardStats);

module.exports = router;
