const Issue = require("../models/Issue");
const Book = require("../models/Book");

const FINE_PER_DAY = 5; // ₹5 per day

const calcFine = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  if (now <= due) return 0;
  const overdueDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
  return overdueDays * FINE_PER_DAY;
};

const issueBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: "userId and bookId are required" });
    }

    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed to issue for another user" });
    }

    const existingIssue = await Issue.findOne({ userId, bookId, returnDate: null });
    if (existingIssue) {
      return res.status(400).json({ message: "Book already issued by this user" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.quantity <= 0) {
      return res.status(400).json({ message: "Book is out of stock" });
    }

    book.quantity -= 1;
    book.issueCount += 1;
    await book.save();

    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const issue = await Issue.create({
      userId,
      bookId,
      issueDate,
      dueDate,
      returnDate: null,
      fine: 0,
      status: "active",
    });

    return res.status(201).json(issue);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: "Issue record not found" });
    }

    if (req.user.role !== "admin" && issue.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to return this issue" });
    }

    if (issue.returnDate) {
      return res.status(400).json({ message: "Book already returned" });
    }

    const fine = calcFine(issue.dueDate);
    issue.returnDate = new Date();
    issue.fine = fine;
    issue.status = "returned";
    await issue.save();

    const book = await Book.findById(issue.bookId);
    if (book) {
      book.quantity += 1;
      await book.save();
    }

    return res.status(200).json({
      message: "Book returned successfully",
      fine,
      issue,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const renewBook = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id).populate("bookId", "title");

    if (!issue) {
      return res.status(404).json({ message: "Issue record not found" });
    }

    if (req.user.role !== "admin" && issue.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to renew this book" });
    }

    if (issue.returnDate) {
      return res.status(400).json({ message: "Returned books cannot be renewed" });
    }

    const now = new Date();
    if (now > new Date(issue.dueDate)) {
      return res.status(400).json({
        message: "Overdue books cannot be renewed online. Please return the book and clear pending fines at the library counter.",
      });
    }

    const currentRenewals = issue.renewCount || 0;
    if (currentRenewals >= 2) {
      return res.status(400).json({
        message: "Maximum renewal limit reached (2 renewals). Please return the book so other students can borrow it.",
      });
    }

    const extensionDays = 14;
    const newDueDate = new Date(Math.max(now.getTime(), new Date(issue.dueDate).getTime()) + extensionDays * 24 * 60 * 60 * 1000);

    issue.dueDate = newDueDate;
    issue.renewCount = currentRenewals + 1;
    issue.lastRenewedDate = now;
    await issue.save();

    return res.status(200).json({
      message: `Book "${issue.bookId?.title || 'Book'}" renewed successfully until ${newDueDate.toLocaleDateString("en-IN")}.`,
      issue,
      renewalsLeft: 2 - issue.renewCount,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during renewal", error: error.message });
  }
};

const getUserIssues = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed to view another user issues" });
    }

    const issues = await Issue.find({ userId })
      .populate("bookId", "title author category coverColor")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Refresh overdue status on-the-fly
    const now = new Date();
    const updatedIssues = issues.map((issue) => {
      const obj = issue.toObject();
      if (!obj.returnDate && now > new Date(obj.dueDate)) {
        obj.status = "overdue";
        obj.fine = calcFine(obj.dueDate);
      }
      return obj;
    });

    return res.status(200).json(updatedIssues);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("bookId", "title author category coverColor")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const now = new Date();
    const updatedIssues = issues.map((issue) => {
      const obj = issue.toObject();
      if (!obj.returnDate && now > new Date(obj.dueDate)) {
        obj.status = "overdue";
        obj.fine = calcFine(obj.dueDate);
      }
      return obj;
    });

    return res.status(200).json(updatedIssues);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOverdueIssues = async (req, res) => {
  try {
    const now = new Date();
    const issues = await Issue.find({
      returnDate: null,
      dueDate: { $lt: now },
    })
      .populate("bookId", "title author category")
      .populate("userId", "name email")
      .sort({ dueDate: 1 });

    const withFines = issues.map((issue) => {
      const obj = issue.toObject();
      obj.fine = calcFine(obj.dueDate);
      obj.status = "overdue";
      return obj;
    });

    return res.status(200).json(withFines);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { issueBook, returnBook, renewBook, getUserIssues, getAllIssues, getOverdueIssues };
