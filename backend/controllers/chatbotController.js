const Book = require("../models/Book");

const normalize = (text) => text.toLowerCase().replace(/\s+/g, " ").trim();

const totalQuantity = (books) =>
  books.reduce((sum, book) => sum + book.quantity, 0);

const listBooks = (books) =>
  books
    .slice(0, 20)
    .map(
      (book) =>
        `${book.title} by ${book.author} (${book.category}) - quantity ${book.quantity}`
    )
    .join(" | ");

const findBook = (books, message) =>
  books.find((book) => message.includes(book.title.toLowerCase()));

const buildReply = (books, rawMessage) => {
  const message = normalize(rawMessage || "");

  if (!message) {
    return "Type a question like: total books, list books, or quantity of Clean Code.";
  }

  if (/(hi|hello|hey)/.test(message)) {
    return "Hello! I am your library chatbot. Ask me about book quantity or inventory.";
  }

  if (/(help|commands|what can you do)/.test(message)) {
    return "Ask: total books, available books, list books, or quantity of Atomic Habits.";
  }

  if (/(total books|book count|how many books)/.test(message)) {
    return `Total available copies in library: ${totalQuantity(books)}.`;
  }

  if (/(available books|books available|in stock)/.test(message)) {
    return `Available copies right now: ${totalQuantity(books)}.`;
  }

  if (/(list books|show books|inventory)/.test(message)) {
    if (books.length === 0) return "No books found in inventory.";
    return `Inventory: ${listBooks(books)}`;
  }

  if (/(quantity|stock|copies)/.test(message)) {
    const book = findBook(books, message);
    if (book) {
      return `${book.title} by ${book.author} currently has quantity ${book.quantity}.`;
    }
  }

  return "I could not understand. Try: quantity of Clean Code, total books, available books, or list books.";
};

const askChatbot = async (req, res) => {
  try {
    const books = await Book.find().lean();
    const reply = buildReply(books, req.body.message);
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { askChatbot };
