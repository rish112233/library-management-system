const express = require("express");
const {
  issueBook,
  returnBook,
  getUserIssues,
  getAllIssues,
} = require("../controllers/issueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, issueBook);
router.put("/return/:id", protect, returnBook);
router.get("/user/:userId", protect, getUserIssues);
router.get("/", protect, adminOnly, getAllIssues);

module.exports = router;
