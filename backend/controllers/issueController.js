const Issue = require("../models/Issue");
const Book = require("../models/Book");

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
    await book.save();

    const issue = await Issue.create({
      userId,
      bookId,
      issueDate: new Date(),
      returnDate: null,
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

    issue.returnDate = new Date();
    await issue.save();

    const book = await Book.findById(issue.bookId);
    if (book) {
      book.quantity += 1;
      await book.save();
    }

    return res.status(200).json({ message: "Book returned successfully", issue });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserIssues = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed to view another user issues" });
    }
    const issues = await Issue.find({ userId })
      .populate("bookId", "title author category")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(issues);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("bookId", "title author category")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(issues);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { issueBook, returnBook, getUserIssues, getAllIssues };
