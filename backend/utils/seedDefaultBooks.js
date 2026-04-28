const Book = require("../models/Book");
const defaultBooks = require("../data/defaultBooks");

const seedDefaultBooks = async () => {
  const existingBooks = await Book.find({}, "title").lean();
  const existingTitleSet = new Set(
    existingBooks.map((book) => book.title.toLowerCase())
  );

  const missingBooks = defaultBooks.filter(
    (book) => !existingTitleSet.has(book.title.toLowerCase())
  );

  if (missingBooks.length > 0) {
    await Book.insertMany(missingBooks);
    console.log(`Seeded ${missingBooks.length} default books.`);
  } else {
    console.log("Default books already available.");
  }
};

module.exports = seedDefaultBooks;
