import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookReaderModal from "../components/BookReaderModal";
import BookContentEditorModal from "../components/BookContentEditorModal";

// Helper for quantity badges
const getQtyClass = (qty) => {
  if (qty === 0) return "empty";
  if (qty <= 2) return "low";
  return "available";
};

// Month name helper
const monthName = (m) =>
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  // Book management forms
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    quantity: 5,
    description: "",
    isbn: "",
    publishedYear: new Date().getFullYear(),
  });
  const [editingBook, setEditingBook] = useState(null);
  const [editingContentBook, setEditingContentBook] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [message, setMessage] = useState({ text: "", type: "info" });
  
  // Navigation & filters
  const [activeTab, setActiveTab] = useState("books"); // books | issues | students | overdue | analytics
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("active"); // active | returned | all
  const [studentSearch, setStudentSearch] = useState("");
  const [readingBook, setReadingBook] = useState(null);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);
  const showMsg = (text, type = "info") => setMessage({ text, type });
  const clearMsg = () => setMessage({ text: "", type: "info" });

  const loadBooks = async (search = searchQuery, cat = categoryFilter) => {
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (cat !== "all") params.category = cat;
      const res = await API.get("/books", { params });
      setBooks(res.data.books || res.data);
    } catch (err) {
      console.warn("Could not load books:", err.message);
    }
  };

  const loadIssues = async () => {
    try {
      const res = await API.get("/issues");
      setIssues(res.data);
    } catch (err) {
      console.warn("Could not load issues:", err.message);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await API.get("/auth/students");
      setStudents(res.data || []);
    } catch (err) {
      console.warn("Could not load students:", err.message);
    }
  };

  const loadAnalytics = async () => {
    try {
      const [statsRes, popularRes, catRes] = await Promise.all([
        API.get("/analytics/stats"),
        API.get("/analytics/popular"),
        API.get("/analytics/categories"),
      ]);
      setStats(statsRes.data);
      setPopularBooks(popularRes.data);
      setCategoryStats(catRes.data);
    } catch (err) {
      console.warn("Could not load analytics:", err.message);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadBooks(), loadIssues(), loadStudents(), loadAnalytics()]);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to sync administrative data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSearch = (val) => {
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadBooks(val, categoryFilter), 350);
  };

  const handleCategoryFilter = (val) => {
    setCategoryFilter(val);
    loadBooks(searchQuery, val);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    clearMsg();
    try {
      await API.post("/books", {
        ...form,
        quantity: Number(form.quantity),
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      });
      showMsg(`✅ Book "${form.title}" added to library catalog!`, "success");
      setForm({
        title: "",
        author: "",
        category: "",
        quantity: 5,
        description: "",
        isbn: "",
        publishedYear: new Date().getFullYear(),
      });
      await Promise.all([loadBooks(), loadAnalytics()]);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to add book", "error");
    }
  };

  const handleUpdateQty = async (bookId) => {
    if (!editQty || isNaN(editQty) || Number(editQty) < 0) return;
    clearMsg();
    try {
      await API.put(`/books/${bookId}`, { quantity: Number(editQty) });
      setEditingBook(null);
      setEditQty("");
      showMsg("✅ Book inventory quantity updated!", "success");
      await Promise.all([loadBooks(), loadAnalytics()]);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to update quantity", "error");
    }
  };

  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from catalog?`)) return;
    clearMsg();
    try {
      await API.delete(`/books/${id}`);
      showMsg(`🗑️ "${title}" removed from catalog`, "warning");
      await Promise.all([loadBooks(), loadAnalytics()]);
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to delete book", "error");
    }
  };

  const handleReturn = async (issueId) => {
    clearMsg();
    try {
      const res = await API.put(`/issues/return/${issueId}`);
      const fine = res.data?.fine;
      await Promise.all([loadIssues(), loadBooks(), loadAnalytics()]);
      if (fine > 0) {
        showMsg(`📚 Book returned. Assessed Overdue Fine: ₹${fine}`, "warning");
      } else {
        showMsg("✅ Book returned cleanly with zero fines accrued.", "success");
      }
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to process return", "error");
    }
  };

  const handleToggleStudent = async (studentId) => {
    clearMsg();
    try {
      const res = await API.put(`/auth/students/${studentId}/status`);
      showMsg(`Account status updated: ${res.data?.status}`, "success");
      await loadStudents();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to change student status", "error");
    }
  };

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
    if (issueFilter === "active") return !issue.returnDate;
    if (issueFilter === "returned") return Boolean(issue.returnDate);
    return true;
  });

  const overdueList = issues.filter(
    (issue) => !issue.returnDate && new Date(issue.dueDate) < new Date()
  );

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    );
  });

  const categories = ["all", ...new Set(books.map((b) => b.category))];
  const maxCatCount = Math.max(...categoryStats.map((c) => c.bookCount), 1);

  return (
    <div className="dashboard-page-root">
      <Navbar />

      <main className="dashboard-container">
        {/* Modals */}
        {readingBook && (
          <BookReaderModal
            book={readingBook}
            onClose={() => setReadingBook(null)}
          />
        )}
        {editingContentBook && (
          <BookContentEditorModal
            book={editingContentBook}
            onClose={() => setEditingContentBook(null)}
            onSaved={() => {
              loadBooks();
              showMsg("✅ Digital chapters and book content updated!", "success");
            }}
          />
        )}

        {/* Global Alert Notification */}
        {message.text && (
          <div className={`catalog-alert ${message.type}`} style={{ marginBottom: 20 }}>
            <span>{message.type === "success" ? "✓" : "⚠️"} {message.text}</span>
            <button onClick={clearMsg} className="alert-close-btn">✕</button>
          </div>
        )}

        {/* Header Console Bar */}
        <div className="dashboard-header-bar">
          <div>
            <span className="badge-tag">Administrative Console</span>
            <h1>Library Management Control Center</h1>
            <p>Supervise catalog inventory, circulation desk loans, student rosters, and fine collections.</p>
          </div>
          <div className="header-actions">
            <button onClick={refreshAll} disabled={loading} className="btn-action-outline">
              🔄 {loading ? "Syncing..." : "Sync Database"}
            </button>
            <Link to="/catalog" className="btn-action-outline">
              🌐 View Public Catalog
            </Link>
          </div>
        </div>

        {/* Executive KPI Stats Bar */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon blue">📚</div>
            <div className="stat-info">
              <p>Total Titles</p>
              <h3>{stats?.totalBooks || books.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🎓</div>
            <div className="stat-info">
              <p>Registered Students</p>
              <h3>{stats?.totalUsers || students.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">🔄</div>
            <div className="stat-info">
              <p>Active Loans</p>
              <h3>{stats?.activeIssues || issues.filter((i) => !i.returnDate).length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">⚠️</div>
            <div className="stat-info">
              <p>Overdue Items</p>
              <h3 style={{ color: overdueList.length > 0 ? "#fb7185" : "#f8fafc" }}>
                {overdueList.length}
              </h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">💰</div>
            <div className="stat-info">
              <p>Fines Collected</p>
              <h3 style={{ color: "#10b981" }}>₹{stats?.totalFineCollected || 0}</h3>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="tabs">
          {[
            { key: "books", label: `📚 Catalog Inventory (${books.length})` },
            { key: "issues", label: `🔄 Circulation Desk (${filteredIssues.length})` },
            { key: "students", label: `🎓 Student Roster (${students.length})` },
            { key: "overdue", label: `⚠️ Overdue & Fines (${overdueList.length})` },
            { key: "analytics", label: "📊 Analytics & Reports" },
          ].map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════ TAB 1: BOOKS INVENTORY ═══════════════ */}
        {activeTab === "books" && (
          <div className="two-col">
            {/* Left: Inventory List */}
            <div className="card" style={{ flex: 1.6 }}>
              <div className="card-header">
                <div>
                  <h3>📚 Catalog Inventory</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                    Inspect quantities, edit digital chapters, or update available stock.
                  </p>
                </div>
                <span className="badge blue">{books.length} Books</span>
              </div>

              {/* Search & Filter */}
              <div className="search-row" style={{ marginBottom: 18 }}>
                <input
                  placeholder="🔍 Filter by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ flex: 2 }}
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="list">
                {books.map((book) => {
                  const qtyClass = getQtyClass(book.quantity);
                  const isEditingThis = editingBook?._id === book._id;

                  return (
                    <div className="item" key={book._id}>
                      <div className="item-left">
                        <div
                          className="book-color-dot"
                          style={{ background: book.coverColor || "#6366f1" }}
                        >
                          📖
                        </div>
                        <div className="item-content">
                          <p className="title">
                            <Link to={`/books/${book._id}`} className="book-link-hover">
                              {book.title}
                            </Link>
                          </p>
                          <p className="meta">
                            {book.author} · <span className="badge gray">{book.category}</span>
                            {book.publishedYear && <> · {book.publishedYear}</>}
                            {book.isbn && <> · ISBN: {book.isbn}</>}
                          </p>
                          <p className="meta" style={{ marginTop: 4 }}>
                            Total Volume: <strong>{book.totalQuantity || book.quantity}</strong> | Available: <strong>{book.quantity}</strong> | Loans: <strong>{book.issueCount || 0}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="item-actions">
                        {isEditingThis ? (
                          <div className="inline-edit">
                            <input
                              type="number"
                              min="0"
                              value={editQty}
                              onChange={(e) => setEditQty(e.target.value)}
                              placeholder="New total"
                              style={{ width: 80, padding: "4px 8px" }}
                            />
                            <button
                              onClick={() => handleUpdateQty(book._id)}
                              className="sm primary"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingBook(null)}
                              className="sm ghost"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className={`quantity-badge ${qtyClass}`}>
                              {book.quantity} in stock
                            </span>

                            <button
                              type="button"
                              className="sm ghost"
                              onClick={() => {
                                setEditingBook(book);
                                setEditQty(book.totalQuantity || book.quantity);
                              }}
                              title="Update physical stock count"
                            >
                              ✏️ Stock
                            </button>

                            <button
                              type="button"
                              className="sm ghost"
                              onClick={() => setEditingContentBook(book)}
                              title="Edit digital book chapters"
                            >
                              📝 Chapters
                            </button>

                            <button
                              type="button"
                              className="sm ghost"
                              onClick={() => setReadingBook(book)}
                              title="Preview reader modal"
                            >
                              👁️
                            </button>

                            <button
                              onClick={() => handleDeleteBook(book._id, book.title)}
                              className="sm danger ghost"
                              title="Delete book from catalog"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {books.length === 0 && (
                  <div className="empty-state">
                    <div className="icon">📭</div>
                    <p>No books match your criteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Add New Book Form */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <h3>➕ Add New Volume to Catalog</h3>
              </div>
              <form onSubmit={handleAddBook} className="form">
                <input
                  placeholder="Book Title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <input
                  placeholder="Author Name *"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  required
                />
                <input
                  placeholder="Category / Genre * (e.g. Programming, Fiction)"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="number"
                    min="1"
                    placeholder="Copies Count *"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    placeholder="Pub Year"
                    value={form.publishedYear}
                    onChange={(e) => setForm({ ...form, publishedYear: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
                <input
                  placeholder="ISBN Code (e.g. 978-0132350884)"
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                />
                <textarea
                  placeholder="Brief synopsis or academic description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                />
                <button type="submit" className="primary" style={{ padding: "12px", marginTop: 4 }}>
                  Add Book to Repository
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 2: CIRCULATION DESK ═══════════════ */}
        {activeTab === "issues" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>🔄 Circulation Desk Logs</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Monitor student borrowings, verify return dates, and calculate overdue penalties.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`tab-btn sm ${issueFilter === "active" ? "active" : ""}`}
                  onClick={() => setIssueFilter("active")}
                >
                  Active Loans ({issues.filter((i) => !i.returnDate).length})
                </button>
                <button
                  className={`tab-btn sm ${issueFilter === "returned" ? "active" : ""}`}
                  onClick={() => setIssueFilter("returned")}
                >
                  Returned Archives
                </button>
                <button
                  className={`tab-btn sm ${issueFilter === "all" ? "active" : ""}`}
                  onClick={() => setIssueFilter("all")}
                >
                  All History
                </button>
              </div>
            </div>

            <div className="list">
              {filteredIssues.map((issue) => {
                const book = issue.bookId || {};
                const student = issue.userId || {};
                const isReturned = Boolean(issue.returnDate);
                const isOverdue = !isReturned && new Date(issue.dueDate) < new Date();
                const daysOverdue = isOverdue
                  ? Math.ceil((new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24))
                  : 0;
                const fine = isOverdue ? daysOverdue * 5 : issue.fine || 0;

                return (
                  <div
                    className={`item ${isOverdue ? "overdue-item" : ""}`}
                    key={issue._id}
                  >
                    <div className="item-left">
                      <div
                        className="book-color-dot"
                        style={{ background: book.coverColor || "#6366f1" }}
                      >
                        📖
                      </div>
                      <div className="item-content">
                        <p className="title">
                          <Link to={`/books/${book._id}`} className="book-link-hover">
                            {book.title || "Untitled Book"}
                          </Link>
                        </p>
                        <p className="meta">
                          Scholar: <strong>{student.name || "Student"}</strong> ({student.email})
                        </p>
                        <p className="meta" style={{ marginTop: 4 }}>
                          Issued: {new Date(issue.issueDate).toLocaleDateString("en-IN")} &nbsp;|&nbsp;
                          Due: {new Date(issue.dueDate).toLocaleDateString("en-IN")}
                          {isReturned && (
                            <> &nbsp;|&nbsp; Returned: {new Date(issue.returnDate).toLocaleDateString("en-IN")}</>
                          )}
                          {issue.renewCount > 0 && (
                            <> &nbsp;|&nbsp; 🔄 {issue.renewCount} Renewals</>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="item-actions">
                      {isOverdue && (
                        <span className="badge red">
                          ⚠️ {daysOverdue}d Overdue · Fine: ₹{fine}
                        </span>
                      )}
                      {isReturned && <span className="badge green">✓ Returned</span>}
                      {!isReturned && !isOverdue && (
                        <span className="badge blue">🟢 Active Loan</span>
                      )}

                      {!isReturned && (
                        <button
                          onClick={() => handleReturn(issue._id)}
                          className="sm primary"
                          title="Process book return into repository"
                        >
                          Mark Returned
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredIssues.length === 0 && (
                <div className="empty-state">
                  <div className="icon">🔄</div>
                  <p>No records found in this circulation filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 3: STUDENT MANAGEMENT ═══════════════ */}
        {activeTab === "students" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>🎓 Registered Students Directory</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Review student accounts, track loan counts, and toggle account privileges.
                </p>
              </div>
              <span className="badge purple">{students.length} Students</span>
            </div>

            <div className="search-row" style={{ marginBottom: 18 }}>
              <input
                placeholder="🔍 Search students by name, email, or department..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            <div className="data-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th>Active Loans</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => (
                    <tr key={st._id}>
                      <td>
                        <strong>{st.name}</strong>
                      </td>
                      <td>{st.email}</td>
                      <td>{st.department || "General"}</td>
                      <td>
                        <span className="badge blue">
                          {st.activeIssuesCount || 0} books
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            st.status === "suspended" ? "red" : "green"
                          }`}
                        >
                          {st.status === "suspended" ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td>
                        {st.createdAt
                          ? new Date(st.createdAt).toLocaleDateString("en-IN")
                          : "2026"}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStudent(st._id)}
                          className={`sm ${
                            st.status === "suspended" ? "primary" : "danger ghost"
                          }`}
                        >
                          {st.status === "suspended" ? "Reactivate" : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: 30 }}>
                        No registered students found matching search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 4: OVERDUE & FINES ═══════════════ */}
        {activeTab === "overdue" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>⚠️ Overdue Loans & Accrued Fines</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Priority queue of unreturned books past their due date (statutory rate ₹5/day).
                </p>
              </div>
              <span className="badge red">{overdueList.length} Overdue</span>
            </div>

            <div className="list">
              {overdueList.map((issue) => {
                const book = issue.bookId || {};
                const student = issue.userId || {};
                const daysOverdue = Math.ceil(
                  (new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24)
                );
                const fine = daysOverdue * 5;

                return (
                  <div className="item overdue-item" key={issue._id}>
                    <div className="item-left">
                      <div className="book-color-dot" style={{ background: "#ef4444" }}>
                        ⚠️
                      </div>
                      <div className="item-content">
                        <p className="title">
                          <Link to={`/books/${book._id}`} className="book-link-hover">
                            {book.title || "Untitled Book"}
                          </Link>
                        </p>
                        <p className="meta">
                          Scholar: <strong>{student.name || "Student"}</strong> ({student.email})
                        </p>
                        <p className="meta" style={{ marginTop: 4 }}>
                          Due Date: {new Date(issue.dueDate).toLocaleDateString("en-IN")} &nbsp;|&nbsp;
                          <strong style={{ color: "#ef4444" }}>{daysOverdue} Days Overdue</strong>
                        </p>
                      </div>
                    </div>

                    <div className="item-actions">
                      <span className="fine-badge" style={{ fontSize: 14 }}>
                        💰 Fine: ₹{fine}
                      </span>
                      <button
                        onClick={() => handleReturn(issue._id)}
                        className="sm primary"
                      >
                        Settle & Return
                      </button>
                    </div>
                  </div>
                );
              })}

              {overdueList.length === 0 && (
                <div className="empty-state">
                  <div className="icon">🎉</div>
                  <h3>No Overdue Books!</h3>
                  <p>All active loans are currently within their allotted circulation window.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 5: ANALYTICS & REPORTS ═══════════════ */}
        {activeTab === "analytics" && (
          <div className="two-col">
            {/* Most Popular Books */}
            <div className="card">
              <div className="card-header">
                <h3>🏆 Top Circulated Titles Leaderboard</h3>
              </div>
              <div className="popular-list">
                {popularBooks.map((book, i) => (
                  <div className="popular-item" key={book._id}>
                    <div
                      className={`popular-rank ${
                        i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div
                      className="book-color-dot"
                      style={{
                        background: book.coverColor || "#7b61ff",
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        fontSize: 13,
                      }}
                    >
                      📖
                    </div>
                    <div className="popular-info">
                      <div className="title">{book.title}</div>
                      <div className="author">{book.author} · {book.category}</div>
                    </div>
                    <div className="popular-count">🔥 {book.issueCount || 0} loans</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown & Monthly Activity */}
            <div className="card">
              <div className="card-header">
                <h3>📂 Holdings by Genre / Category</h3>
              </div>
              <div className="category-chart">
                {categoryStats.map((cat) => (
                  <div className="chart-row" key={cat._id}>
                    <div className="chart-label" title={cat._id}>
                      {cat._id}
                    </div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{ width: `${(cat.bookCount / maxCatCount) * 100}%` }}
                      />
                    </div>
                    <div className="chart-count">{cat.bookCount} titles</div>
                  </div>
                ))}
              </div>

              {stats?.monthlyActivity?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ margin: "0 0 12px", color: "var(--text-secondary)" }}>
                    📅 Monthly Circulation Volume (Past 6 Months)
                  </h4>
                  <div className="category-chart">
                    {stats.monthlyActivity.map((m) => {
                      const maxMonthly = Math.max(
                        ...stats.monthlyActivity.map((x) => x.count),
                        1
                      );
                      return (
                        <div
                          className="chart-row"
                          key={`${m._id.year}-${m._id.month}`}
                        >
                          <div className="chart-label">
                            {monthName(m._id.month)} {m._id.year}
                          </div>
                          <div className="chart-bar-track">
                            <div
                              className="chart-bar-fill"
                              style={{
                                width: `${(m.count / maxMonthly) * 100}%`,
                                background: "linear-gradient(90deg, #10b981, #059669)",
                              }}
                            />
                          </div>
                          <div className="chart-count">{m.count} issues</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
