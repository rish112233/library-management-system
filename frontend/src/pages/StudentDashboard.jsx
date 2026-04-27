import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function StudentDashboard() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");

  const loadBooks = async () => {
    const res = await API.get("/books");
    setBooks(res.data);
  };

  const loadIssues = async () => {
    const res = await API.get(`/issues/user/${userId}`);
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

  const handleIssue = async (bookId) => {
    setMessage("");
    try {
      await API.post("/issues", { userId, bookId });
      await Promise.all([loadBooks(), loadIssues()]);
      setMessage("Book issued successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to issue book");
    }
  };

  const handleReturn = async (issueId) => {
    setMessage("");
    try {
      await API.put(`/issues/return/${issueId}`);
      await Promise.all([loadBooks(), loadIssues()]);
      setMessage("Book returned successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to return book");
    }
  };

  return (
    <div className="page">
      <Navbar title="Student Dashboard" />
      {message && <p className="message">{message}</p>}

      <div className="card">
        <h3>Available Books</h3>
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
              <button disabled={book.quantity <= 0} onClick={() => handleIssue(book._id)}>
                Issue
              </button>
            </div>
          ))}
          {books.length === 0 && <p>No books available.</p>}
        </div>
      </div>

      <div className="card">
        <h3>My Issued Books</h3>
        <div className="list">
          {issues.map((issue) => (
            <div className="item" key={issue._id}>
              <div>
                <p>
                  <strong>{issue.bookId?.title}</strong> by {issue.bookId?.author}
                </p>
                <p>
                  Issued: {new Date(issue.issueDate).toLocaleDateString()} | Returned:{" "}
                  {issue.returnDate ? "Yes" : "No"}
                </p>
              </div>
              {!issue.returnDate && (
                <button onClick={() => handleReturn(issue._id)}>Return</button>
              )}
            </div>
          ))}
          {issues.length === 0 && <p>No issued books.</p>}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
