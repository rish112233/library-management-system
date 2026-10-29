const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isbn: {
      type: String,
      trim: true,
      default: "",
    },
    publishedYear: {
      type: Number,
      default: null,
    },
    coverColor: {
      type: String,
      default: "#4f8cff",
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      // availableQuantity
      type: Number,
      required: true,
      min: 0,
    },
    issueCount: {
      // how many times this book was ever issued (popularity)
      type: Number,
      default: 0,
    },
    chapters: [
      {
        number: { type: Number },
        title: { type: String, trim: true },
        content: { type: String }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
