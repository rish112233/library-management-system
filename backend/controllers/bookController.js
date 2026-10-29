const Book = require("../models/Book");

// Predefined cover colors per category
const categoryColors = {
  programming: "#4f8cff",
  science: "#06b6d4",
  mathematics: "#8b5cf6",
  history: "#f59e0b",
  literature: "#ec4899",
  fiction: "#10b981",
  biography: "#f97316",
  philosophy: "#6366f1",
  psychology: "#14b8a6",
  default: "#7b61ff",
};

const getCoverColor = (category) => {
  const key = (category || "").toLowerCase().trim();
  return categoryColors[key] || categoryColors.default;
};

const getBooks = async (req, res) => {
  try {
    const { search, category, availableOnly, sort = "newest", page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { author: { $regex: search.trim(), $options: "i" } },
        { isbn: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      query.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    if (availableOnly === "true" || availableOnly === true) {
      query.quantity = { $gt: 0 };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "popular") sortOptions = { issueCount: -1 };
    else if (sort === "title") sortOptions = { title: 1 };
    else if (sort === "year") sortOptions = { publishedYear: -1 };
    else if (sort === "available") sortOptions = { quantity: -1 };

    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
    const parsedPage = Math.max(1, Number(page));
    const skip = (parsedPage - 1) * parsedLimit;

    const [books, total] = await Promise.all([
      Book.find(query).sort(sortOptions).skip(skip).limit(parsedLimit),
      Book.countDocuments(query),
    ]);

    return res.status(200).json({
      books,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addBook = async (req, res) => {
  try {
    const { title, author, category, quantity, description, isbn, publishedYear } = req.body;

    if (!title || !author || !category || quantity === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const qty = Number(quantity);
    const coverColor = getCoverColor(category);

    const book = await Book.create({
      title,
      author,
      category,
      quantity: qty,
      totalQuantity: qty,
      description: description || "",
      isbn: isbn || "",
      publishedYear: publishedYear || null,
      coverColor,
    });

    return res.status(201).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, category, quantity, description, isbn, publishedYear, chapters } = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // If quantity changed, adjust available quantity proportionally
    if (quantity !== undefined) {
      const newTotal = Number(quantity);
      const issued = book.totalQuantity - book.quantity;
      const newAvailable = Math.max(0, newTotal - issued);
      book.totalQuantity = newTotal;
      book.quantity = newAvailable;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (category) {
      book.category = category;
      book.coverColor = getCoverColor(category);
    }
    if (description !== undefined) book.description = description;
    if (isbn !== undefined) book.isbn = isbn;
    if (publishedYear !== undefined) book.publishedYear = publishedYear;
    if (chapters !== undefined) book.chapters = chapters;

    await book.save();
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Book.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalCopies = await Book.aggregate([
      { $group: { _id: null, total: { $sum: "$totalQuantity" }, available: { $sum: "$quantity" } } },
    ]);

    const categoryStats = await Book.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, copies: { $sum: "$totalQuantity" } } },
      { $sort: { count: -1 } },
    ]);

    const popularBooks = await Book.find()
      .sort({ issueCount: -1 })
      .limit(5)
      .select("title author issueCount category coverColor");

    return res.status(200).json({
      totalBooks,
      totalCopies: totalCopies[0]?.total || 0,
      availableCopies: totalCopies[0]?.available || 0,
      categoryStats,
      popularBooks,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getBooks, getBookById, addBook, updateBook, deleteBook, getBookStats };
