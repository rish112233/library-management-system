const Book = require("../models/Book");

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addBook = async (req, res) => {
  try {
    const { title, author, category, quantity } = req.body;

    if (!title || !author || !category || quantity === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const book = await Book.create({
      title,
      author,
      category,
      quantity,
    });

    return res.status(201).json(book);
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

module.exports = { getBooks, addBook, deleteBook };
