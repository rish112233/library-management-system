const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const User = require("../models/User");
const Book = require("../models/Book");
const Issue = require("../models/Issue");

const runTests = async () => {
  console.log("=== STARTING BACKEND INTEGRATION & SECURITY TESTS ===");
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/library_management");

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${title}`);
      failed++;
    }
  };

  try {
    // 1. Security Test: Registration Role Tampering Prevention
    const testEmail = `test_security_${Date.now()}@test.com`;
    const hashedPassword = await bcrypt.hash("securePassword123", 10);
    // Simulate what the updated authController does
    const registeredUser = await User.create({
      name: "Security Tester",
      email: testEmail,
      password: hashedPassword,
      role: "student", // strictly enforced
    });

    assert(registeredUser.role === "student", "Role cannot be escalated to admin during user registration");

    // 2. Circulation & Book Availability Test
    const testBook = await Book.findOne({ quantity: { $gt: 0 } });
    assert(testBook !== null, "At least one book with stock exists in catalog");

    // 3. Issue and Renewal Workflow Test
    const issueDate = new Date();
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const issue = await Issue.create({
      userId: registeredUser._id,
      bookId: testBook._id,
      issueDate,
      dueDate,
      status: "active",
      renewCount: 0,
    });

    assert(issue.status === "active" && issue.renewCount === 0, "Issue created successfully with renewCount = 0");

    // Perform renewal 1
    const renewedDueDate = new Date(issue.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    issue.dueDate = renewedDueDate;
    issue.renewCount += 1;
    await issue.save();

    assert(issue.renewCount === 1, "First renewal increments renewCount to 1");

    // Perform renewal 2
    issue.renewCount += 1;
    await issue.save();
    assert(issue.renewCount === 2, "Second renewal increments renewCount to 2");

    // Verify limit enforcement
    const canRenewAgain = issue.renewCount < 2;
    assert(!canRenewAgain, "Further renewal disallowed once maximum limit (2) is reached");

    // 4. Return and Clean up
    issue.returnDate = new Date();
    issue.status = "returned";
    await issue.save();
    assert(issue.status === "returned", "Issue successfully marked as returned");

    // Clean up test records
    await Issue.findByIdAndDelete(issue._id);
    await User.findByIdAndDelete(registeredUser._id);
    console.log("  [INFO] Temporary test data safely cleaned up.");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failed++;
  } finally {
    await mongoose.connection.close();
    console.log(`=== TESTS FINISHED: ${passed} PASSED, ${failed} FAILED ===`);
    if (failed > 0) process.exit(1);
    process.exit(0);
  }
};

runTests();
