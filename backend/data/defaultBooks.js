const categoryColors = {
  programming: "#4f8cff",
  "self help": "#10b981",
  fiction: "#ec4899",
  classic: "#f59e0b",
  fantasy: "#8b5cf6",
  history: "#f97316",
  productivity: "#06b6d4",
  finance: "#14b8a6",
  default: "#7b61ff",
};

const getColor = (cat) => categoryColors[(cat || "").toLowerCase()] || categoryColors.default;

const defaultBooks = [
  { title: "Clean Code", author: "Robert C. Martin", category: "Programming", quantity: 10, totalQuantity: 10, description: "A handbook of agile software craftsmanship.", publishedYear: 2008, coverColor: getColor("Programming"), issueCount: 0 },
  { title: "Atomic Habits", author: "James Clear", category: "Self Help", quantity: 10, totalQuantity: 10, description: "An easy and proven way to build good habits and break bad ones.", publishedYear: 2018, coverColor: getColor("Self Help"), issueCount: 0 },
  { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", quantity: 10, totalQuantity: 10, description: "A story about following your dreams.", publishedYear: 1988, coverColor: getColor("Fiction"), issueCount: 0 },
  { title: "1984", author: "George Orwell", category: "Fiction", quantity: 10, totalQuantity: 10, description: "A dystopian social science fiction novel.", publishedYear: 1949, coverColor: getColor("Fiction"), issueCount: 0 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", quantity: 10, totalQuantity: 10, description: "A story of racial injustice and moral growth.", publishedYear: 1960, coverColor: getColor("Fiction"), issueCount: 0 },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic", quantity: 10, totalQuantity: 10, description: "The great American novel of the Jazz Age.", publishedYear: 1925, coverColor: getColor("Classic"), issueCount: 0 },
  { title: "Pride and Prejudice", author: "Jane Austen", category: "Classic", quantity: 10, totalQuantity: 10, description: "A romantic novel of manners.", publishedYear: 1813, coverColor: getColor("Classic"), issueCount: 0 },
  { title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", quantity: 10, totalQuantity: 10, description: "A fantasy novel about a hobbit's adventure.", publishedYear: 1937, coverColor: getColor("Fantasy"), issueCount: 0 },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", category: "Fantasy", quantity: 10, totalQuantity: 10, description: "A young wizard's journey at Hogwarts.", publishedYear: 1997, coverColor: getColor("Fantasy"), issueCount: 0 },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", category: "Classic", quantity: 10, totalQuantity: 10, description: "A story of teenage alienation and rebellion.", publishedYear: 1951, coverColor: getColor("Classic"), issueCount: 0 },
  { title: "The Kite Runner", author: "Khaled Hosseini", category: "Fiction", quantity: 10, totalQuantity: 10, description: "A story of friendship, betrayal, and redemption.", publishedYear: 2003, coverColor: getColor("Fiction"), issueCount: 0 },
  { title: "Sapiens", author: "Yuval Noah Harari", category: "History", quantity: 10, totalQuantity: 10, description: "A brief history of humankind.", publishedYear: 2011, coverColor: getColor("History"), issueCount: 0 },
  { title: "The Power of Habit", author: "Charles Duhigg", category: "Self Help", quantity: 10, totalQuantity: 10, description: "Why we do what we do in life and business.", publishedYear: 2012, coverColor: getColor("Self Help"), issueCount: 0 },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Programming", quantity: 10, totalQuantity: 10, description: "Your journey to mastery in software development.", publishedYear: 1999, coverColor: getColor("Programming"), issueCount: 0 },
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Programming", quantity: 10, totalQuantity: 10, description: "The definitive reference on algorithms.", publishedYear: 2009, coverColor: getColor("Programming"), issueCount: 0 },
  { title: "Deep Work", author: "Cal Newport", category: "Productivity", quantity: 10, totalQuantity: 10, description: "Rules for focused success in a distracted world.", publishedYear: 2016, coverColor: getColor("Productivity"), issueCount: 0 },
  { title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", category: "Finance", quantity: 10, totalQuantity: 10, description: "What the rich teach their kids about money.", publishedYear: 1997, coverColor: getColor("Finance"), issueCount: 0 },
  { title: "Think and Grow Rich", author: "Napoleon Hill", category: "Finance", quantity: 10, totalQuantity: 10, description: "Philosophy of personal success and achievement.", publishedYear: 1937, coverColor: getColor("Finance"), issueCount: 0 },
  { title: "Ikigai", author: "Francesc Miralles", category: "Self Help", quantity: 10, totalQuantity: 10, description: "The Japanese secret to a long and happy life.", publishedYear: 2016, coverColor: getColor("Self Help"), issueCount: 0 },
  { title: "The Psychology of Money", author: "Morgan Housel", category: "Finance", quantity: 10, totalQuantity: 10, description: "Timeless lessons on wealth, greed, and happiness.", publishedYear: 2020, coverColor: getColor("Finance"), issueCount: 0 },
];

module.exports = defaultBooks;
