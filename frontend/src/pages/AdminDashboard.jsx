import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    quantity: 1,
  });
  const [message, setMessage] = useState("");

  const loadBooks = async () => {
    const res = await API.get("/books");
    setBooks(res.data);
  };

  const loadIssues = async () => {
    const res = await API.get("/issues");
    setIssues(res.data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([loadBooks(), loadIssues()]);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load data");
      }
    };
    fetchData();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/books", {
        ...form,
        quantity: Number(form.quantity),
      });
      setForm({ title: "", author: "", category: "", quantity: 1 });
      await loadBooks();
      setMessage("Book added successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add book");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/books/${id}`);
      await loadBooks();
      setMessage("Book deleted");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete book");
    }
  };

  return (
    <div className="page">
      <Navbar title="Admin Dashboard" />
      {message && <p className="message">{message}</p>}

      <div className="card">
        <h3>Add Book</h3>
        <form onSubmit={handleAddBook} className="form grid">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            required
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
          <button type="submit">Add Book</button>
        </form>
      </div>

      <div className="card">
        <h3>All Books</h3>
        <div className="list">
          {books.map((book) => (
            <div className="item" key={book._id}>
              <div>
                <p>
                  <strong>{book.title}</strong> by {book.author}
                </p>
                <p>
                  Category: {book.category} | Quantity: {book.quantity}
                </p>
              </div>
              <button className="danger" onClick={() => handleDelete(book._id)}>
                Delete
              </button>
            </div>
          ))}
          {books.length === 0 && <p>No books found.</p>}
        </div>
      </div>

      <div className="card">
        <h3>All Issued Books</h3>
        <div className="list">
          {issues.map((issue) => (
            <div className="item" key={issue._id}>
              <p>
                <strong>{issue.bookId?.title}</strong> issued to {issue.userId?.name} (
                {issue.userId?.email})
              </p>
              <p>
                Issued: {new Date(issue.issueDate).toLocaleDateString()} | Returned:{" "}
                {issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : "No"}
              </p>
            </div>
          ))}
          {issues.length === 0 && <p>No issue records found.</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
