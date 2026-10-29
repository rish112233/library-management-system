const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Issue = require("../models/Issue");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Public registration: strictly enforces student role
const register = async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Security: always enforce role as 'student' regardless of payload
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      department: department?.trim() || "General Studies",
      phone: phone?.trim() || "",
      status: "active",
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      role: user.role,
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended. Please contact the library administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      token,
      role: user.role,
      userId: user._id,
      name: user.name,
      email: user.email,
      department: user.department || "General Studies",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Active issues count
    const activeIssues = await Issue.countDocuments({ userId: user._id, returnDate: null });
    const totalBorrowed = await Issue.countDocuments({ userId: user._id });

    return res.status(200).json({
      ...user.toObject(),
      activeIssues,
      totalBorrowed,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, department, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (department !== undefined) user.department = department.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Get all registered students with loan statistics
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Attach active loans count for each student
    const studentIds = students.map((s) => s._id);
    const activeIssues = await Issue.aggregate([
      { $match: { userId: { $in: studentIds }, returnDate: null } },
      { $group: { _id: "$userId", activeCount: { $sum: 1 } } },
    ]);

    const activeMap = {};
    activeIssues.forEach((item) => {
      activeMap[item._id.toString()] = item.activeCount;
    });

    const enrichedStudents = students.map((s) => ({
      ...s,
      activeIssuesCount: activeMap[s._id.toString()] || 0,
    }));

    return res.status(200).json(enrichedStudents);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Toggle student status (active / suspended)
const toggleStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.status = student.status === "suspended" ? "active" : "suspended";
    await student.save();

    return res.status(200).json({
      message: `Student account marked as ${student.status}`,
      status: student.status,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getStudents,
  toggleStudentStatus,
};
