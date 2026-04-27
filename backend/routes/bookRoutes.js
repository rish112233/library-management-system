const express = require("express");
const { getBooks, addBook, deleteBook } = require("../controllers/bookController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getBooks);
router.post("/", protect, adminOnly, addBook);
router.delete("/:id", protect, adminOnly, deleteBook);

module.exports = router;
