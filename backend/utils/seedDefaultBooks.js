const Book = require("../models/Book");
const defaultBooks = require("../data/defaultBooks");

const seedDefaultBooks = async () => {
  const existingBooks = await Book.find({}, "title totalQuantity").lean();
  const existingTitleSet = new Set(
    existingBooks.map((book) => book.title.toLowerCase())
  );

  // Seed missing books
  const missingBooks = defaultBooks.filter(
    (book) => !existingTitleSet.has(book.title.toLowerCase())
  );

  if (missingBooks.length > 0) {
    await Book.insertMany(missingBooks);
    console.log(`Seeded ${missingBooks.length} default books.`);
  } else {
    console.log("Default books already available.");
  }

  // Patch existing books that are missing new fields (totalQuantity, issueCount)
  // Use native collection to support aggregation pipeline in updateMany
  const collection = Book.collection;
  await collection.updateMany(
    { totalQuantity: { $exists: false } },
    [{ $set: { totalQuantity: "$quantity", issueCount: 0, description: "", coverColor: "#7b61ff" } }]
  );
};

module.exports = seedDefaultBooks;
