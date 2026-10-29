const express = require("express");
const router = express.Router();
const {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getBookStats,
} = require("../controllers/bookController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes for catalog and landing page
router.get("/", getBooks);
router.get("/stats", protect, adminOnly, getBookStats);
router.get("/:id", getBookById);

// Admin-only management routes
router.post("/", protect, adminOnly, addBook);
router.put("/:id", protect, adminOnly, updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);

module.exports = router;
