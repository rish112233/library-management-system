const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    returnDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
