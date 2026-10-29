const express = require("express");
const {
  issueBook,
  returnBook,
  renewBook,
  getUserIssues,
  getAllIssues,
  getOverdueIssues,
} = require("../controllers/issueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, issueBook);
router.put("/return/:id", protect, returnBook);
router.post("/renew/:id", protect, renewBook);
router.get("/user/:userId", protect, getUserIssues);
router.get("/", protect, adminOnly, getAllIssues);
router.get("/overdue", protect, adminOnly, getOverdueIssues);

module.exports = router;
