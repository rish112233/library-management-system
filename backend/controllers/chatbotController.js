const Book = require("../models/Book");
const Issue = require("../models/Issue");

const normalize = (text) => text.toLowerCase().replace(/\s+/g, " ").trim();

const totalQuantity = (books) => books.reduce((sum, book) => sum + book.quantity, 0);

const listBooks = (books) =>
  books
    .slice(0, 15)
    .map(
      (book) =>
        `${book.title} by ${book.author} (${book.category}) — ${book.quantity} available`
    )
    .join(" | ");

const findBook = (books, message) =>
  books.find((book) => message.includes(book.title.toLowerCase()));

const FINE_PER_DAY = 5;

const calcFine = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  if (now <= due) return 0;
  return Math.ceil((now - due) / (1000 * 60 * 60 * 24)) * FINE_PER_DAY;
};

const buildReply = async (books, rawMessage, userId) => {
  const message = normalize(rawMessage || "");

  if (!message) {
    return "Type a question like: total books, overdue books, my fine, list books, or quantity of Clean Code.";
  }

  // Greetings
  if (/(hi|hello|hey|namaste)/.test(message)) {
    return "Hello! 👋 I am your Library Assistant. Ask me about books, due dates, fines, or inventory!";
  }

  // Help
  if (/(help|commands|what can you do)/.test(message)) {
    return (
      "You can ask me: \n" +
      "📚 total books | list books | available books\n" +
      "🔍 quantity of [book name] | books in [category]\n" +
      "📅 my due dates | overdue books\n" +
      "💰 my fine | fine amount\n" +
      "🏆 popular books | most issued"
    );
  }

  // Total books
  if (/(total books|book count|how many books|kitni books)/.test(message)) {
    const total = await Book.countDocuments();
    const available = totalQuantity(books);
    return `📚 Library has ${total} unique titles with ${available} total available copies right now.`;
  }

  // Available books
  if (/(available books|books available|in stock|available copies)/.test(message)) {
    return `✅ Currently ${totalQuantity(books)} copies are available across ${books.length} titles.`;
  }

  // List books
  if (/(list books|show books|inventory|sabhi books)/.test(message)) {
    if (books.length === 0) return "No books found in inventory.";
    return `📖 Inventory (first 15):\n${listBooks(books)}`;
  }

  // Popular / most issued
  if (/(popular|most issued|top books|trending)/.test(message)) {
    const popular = await Book.find().sort({ issueCount: -1 }).limit(5).select("title author issueCount");
    if (popular.length === 0) return "No issue data yet.";
    const list = popular.map((b, i) => `${i + 1}. ${b.title} by ${b.author} (${b.issueCount} times issued)`).join("\n");
    return `🏆 Most Popular Books:\n${list}`;
  }

  // Category search
  const categoryMatch = message.match(/books in (.+)|(.+) category/);
  if (categoryMatch) {
    const cat = (categoryMatch[1] || categoryMatch[2] || "").trim();
    const catBooks = await Book.find({ category: { $regex: cat, $options: "i" } }).select("title author quantity");
    if (catBooks.length === 0) return `No books found in "${cat}" category.`;
    return `📂 Books in "${cat}":\n${catBooks.map((b) => `• ${b.title} by ${b.author} (${b.quantity} available)`).join("\n")}`;
  }

  // Quantity of specific book
  if (/(quantity|stock|copies|kitne)/.test(message)) {
    const book = findBook(books, message);
    if (book) {
      const status = book.quantity > 0 ? `✅ ${book.quantity} copies available` : "❌ Out of stock";
      return `📘 "${book.title}" by ${book.author}: ${status}. (Total: ${book.totalQuantity || book.quantity})`;
    }
    return "Could not find that book. Try the exact title, e.g. quantity of Clean Code.";
  }

  // My fine / overdue (requires userId)
  if (/(my fine|fine amount|kitna fine|overdue fine)/.test(message) && userId) {
    const overdueIssues = await Issue.find({
      userId,
      returnDate: null,
      dueDate: { $lt: new Date() },
    }).populate("bookId", "title");

    if (overdueIssues.length === 0) {
      return "✅ Great! You have no pending fines.";
    }

    let totalFine = 0;
    const lines = overdueIssues.map((issue) => {
      const fine = calcFine(issue.dueDate);
      totalFine += fine;
      const overdueDays = Math.ceil((new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));
      return `• ${issue.bookId?.title} — ${overdueDays} days overdue → ₹${fine}`;
    });

    return `💰 Your Pending Fines:\n${lines.join("\n")}\n\nTotal: ₹${totalFine}`;
  }

  // My due dates
  if (/(my due|due date|return date|kab return)/.test(message) && userId) {
    const activeIssues = await Issue.find({ userId, returnDate: null })
      .populate("bookId", "title")
      .sort({ dueDate: 1 });

    if (activeIssues.length === 0) return "You have no books currently issued.";

    const now = new Date();
    const lines = activeIssues.map((issue) => {
      const due = new Date(issue.dueDate);
      const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      const status = daysLeft < 0 ? `⚠️ OVERDUE by ${Math.abs(daysLeft)} days` : daysLeft <= 3 ? `🟡 Due in ${daysLeft} days` : `🟢 Due in ${daysLeft} days`;
      return `• ${issue.bookId?.title} — ${due.toLocaleDateString("en-IN")} (${status})`;
    });

    return `📅 Your Due Dates:\n${lines.join("\n")}`;
  }

  return "🤔 I couldn't understand that. Try: total books, list books, quantity of Atomic Habits, my fine, my due dates, or popular books.";
};

const askChatbot = async (req, res) => {
  try {
    const books = await Book.find().lean();
    // Security: derive identity strictly from verified auth token context
    const userId = req.user ? req.user._id : null;
    const reply = await buildReply(books, req.body.message, userId);
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { askChatbot };
