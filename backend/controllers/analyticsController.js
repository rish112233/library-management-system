const Issue = require("../models/Issue");
const Book = require("../models/Book");
const User = require("../models/User");

const FINE_PER_DAY = 5;

const calcFine = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  if (now <= due) return 0;
  const overdueDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
  return overdueDays * FINE_PER_DAY;
};

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const [totalBooks, totalUsers, activeIssues, overdueIssues, returnedIssues] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: "student" }),
      Issue.countDocuments({ returnDate: null }),
      Issue.countDocuments({ returnDate: null, dueDate: { $lt: now } }),
      Issue.countDocuments({ returnDate: { $ne: null } }),
    ]);

    // Total fine collected from returned books
    const fineAgg = await Issue.aggregate([
      { $match: { returnDate: { $ne: null }, fine: { $gt: 0 } } },
      { $group: { _id: null, totalFine: { $sum: "$fine" } } },
    ]);
    const totalFineCollected = fineAgg[0]?.totalFine || 0;

    // Issues this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const issuesThisMonth = await Issue.countDocuments({ issueDate: { $gte: startOfMonth } });

    // Monthly activity — last 6 months
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyActivity = await Issue.aggregate([
      { $match: { issueDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$issueDate" }, month: { $month: "$issueDate" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return res.status(200).json({
      totalBooks,
      totalUsers,
      activeIssues,
      overdueIssues,
      returnedIssues,
      totalFineCollected,
      issuesThisMonth,
      monthlyActivity,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPopularBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ issueCount: -1 })
      .limit(8)
      .select("title author category issueCount coverColor quantity totalQuantity");

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCategoryStats = async (req, res) => {
  try {
    const stats = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          bookCount: { $sum: 1 },
          totalCopies: { $sum: "$totalQuantity" },
          availableCopies: { $sum: "$quantity" },
        },
      },
      { $sort: { bookCount: -1 } },
    ]);

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPublicOverview = async (req, res) => {
  try {
    const [totalBooks, totalCopies, availableCopies, totalStudents, activeCirculation, popularBooks, categories] = await Promise.all([
      Book.countDocuments(),
      Book.aggregate([{ $group: { _id: null, total: { $sum: "$totalQuantity" } } }]),
      Book.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]),
      User.countDocuments({ role: "student" }),
      Issue.countDocuments({ returnDate: null }),
      Book.find().sort({ issueCount: -1 }).limit(6).select("title author category issueCount coverColor quantity totalQuantity description publishedYear"),
      Book.distinct("category"),
    ]);

    return res.status(200).json({
      totalBooks,
      totalCopies: totalCopies[0]?.total || 0,
      availableCopies: availableCopies[0]?.total || 0,
      totalStudents,
      activeCirculation,
      popularBooks,
      categories,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboardStats, getPopularBooks, getCategoryStats, getPublicOverview };
