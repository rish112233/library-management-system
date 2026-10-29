import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookReaderModal from "../components/BookReaderModal";

// Due date status helper
const getDueStatus = (dueDate, returnDate) => {
  if (returnDate) return { label: "Returned", cls: "green", emoji: "✓", daysLeft: null };
  const now = new Date();
  const due = new Date(dueDate);
  const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: `Overdue by ${Math.abs(daysLeft)}d`, cls: "red", emoji: "⚠️", daysLeft };
  if (daysLeft <= 3) return { label: `Due in ${daysLeft}d`, cls: "yellow", emoji: "🟡", daysLeft };
  return { label: `${daysLeft}d left`, cls: "green", emoji: "🟢", daysLeft };
};

function StudentDashboard() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [readingBook, setReadingBook] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "bot",
      text: "Hello! 👋 I am your Smart Library Assistant.\n\nAsk me anytime about:\n• 📅 my due dates & overdue items\n• 💰 my fine amount\n• 📚 total books in stock\n• 🏆 most popular books across campus\n• 🔍 quantity of [book title]",
    },
  ]);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [activeTab, setActiveTab] = useState("mycollection"); // mycollection | browse | readingroom | history | chatbot
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [renewingId, setRenewingId] = useState(null);

  const chatBoxRef = useRef(null);
  const debounceRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const studentName = localStorage.getItem("name") || "Student";

  const showMsg = (text, type = "info") => setMessage({ text, type });
  const clearMsg = () => setMessage({ text: "", type: "info" });

  const loadBooks = async (search = searchQuery, cat = categoryFilter) => {
    try {
      const res = await API.get("/books", { params: { search, category: cat, limit: 50 } });
      setBooks(res.data.books || res.data);
    } catch (err) {
      console.warn("Could not load books:", err.message);
    }
  };

  const loadIssues = async () => {
    try {
      const res = await API.get(`/issues/user/${userId}`);
      setIssues(res.data);
    } catch (err) {
      console.warn("Could not load issues:", err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadBooks(), loadIssues()]);
      } catch (err) {
        showMsg(err.response?.data?.message || "Failed to load records", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSearch = (val) => {
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadBooks(val, categoryFilter), 400);
  };

  const handleCategoryFilter = (val) => {
    setCategoryFilter(val);
    loadBooks(searchQuery, val);
  };

  const handleIssue = async (bookId) => {
    clearMsg();
    try {
      await API.post("/issues", { userId, bookId });
      await Promise.all([loadBooks(), loadIssues()]);
      showMsg("✅ Book issued! Added to your Collection with chapters ready to read.", "success");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to issue book", "error");
    }
  };

  const handleReturn = async (issueId) => {
    clearMsg();
    try {
      const res = await API.put(`/issues/return/${issueId}`);
      const fine = res.data?.fine;
      await Promise.all([loadBooks(), loadIssues()]);
      if (fine > 0) {
        showMsg(`📚 Book returned. ⚠️ Overdue fine assessed: ₹${fine}`, "warning");
      } else {
        showMsg("✅ Book returned successfully. No fines accrued!", "success");
      }
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to return book", "error");
    }
  };

  // Renewal workflow
  const handleRenew = async (issueId) => {
    clearMsg();
    setRenewingId(issueId);
    try {
      const res = await API.post(`/issues/renew/${issueId}`);
      await loadIssues();
      showMsg(res.data?.message || "✅ Book loan successfully extended by 14 days!", "success");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to renew book loan", "error");
    } finally {
      setRenewingId(null);
    }
  };

  const handleAskChatbot = async (queryText) => {
    const question = (queryText || chatInput).trim();
    if (!question) return;

    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);

    try {
      // Identity derived securely from JWT token context on server
      const res = await API.post("/chatbot/ask", { message: question });
      const reply = res.data?.reply || "No response received from assistant.";
      setChatMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: err.response?.data?.message || "Assistant is temporarily unavailable." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Computed metrics
  const activeIssues = issues.filter((i) => !i.returnDate);
  const returnedIssues = issues.filter((i) => i.returnDate);
  const overdueIssues = activeIssues.filter(
    (i) => i.status === "overdue" || new Date(i.dueDate) < new Date()
  );

  const pendingFine = activeIssues.reduce((sum, issue) => {
    const now = new Date();
    const due = new Date(issue.dueDate);
    if (now > due) {
      const days = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      return sum + days * 5;
    }
    return sum + (issue.fine || 0);
  }, 0);

  const alreadyIssuedIds = new Set(
    activeIssues.map((i) => (i.bookId?._id || i.bookId).toString())
  );
  const categories = ["all", ...new Set(books.map((b) => b.category))];
  const hasOverdue = overdueIssues.length > 0;

  const quickQuestions = [
    "📅 my due dates",
    "💰 my fine",
    "📚 total books",
    "🏆 popular books",
    "🔍 quantity of Clean Code",
  ];

  return (
    <div className="dashboard-page-root">
      <Navbar hasOverdue={hasOverdue} />

      <main className="dashboard-container">
        {/* Reader Modal */}
        {readingBook && (
          <BookReaderModal
            book={readingBook}
            onClose={() => setReadingBook(null)}
          />
        )}

        {/* Global Feedback Banner */}
        {message.text && (
          <div className={`catalog-alert ${message.type}`} style={{ marginBottom: 20 }}>
            <span>{message.type === "success" ? "✓" : "⚠️"} {message.text}</span>
            <button onClick={clearMsg} className="alert-close-btn">✕</button>
          </div>
        )}

        {/* Welcome & Overview Header */}
        <div className="dashboard-header-bar">
          <div>
            <span className="badge-tag">Academic Scholar Portal</span>
            <h1>Welcome, {studentName}</h1>
            <p>Track your active loans, renew eligible textbooks, and explore digital chapters.</p>
          </div>
          <div className="header-actions">
            <Link to="/catalog" className="btn-action-outline">
              🔍 Search Full Catalog
            </Link>
            <Link to="/profile" className="btn-action-outline">
              ⚙️ Account Settings
            </Link>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon blue">📚</div>
            <div className="stat-info">
              <p>Active Borrowings</p>
              <h3>{activeIssues.length} <span className="stat-sub">/ 3 max</span></h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <p>Books Finished</p>
              <h3>{returnedIssues.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">⚠️</div>
            <div className="stat-info">
              <p>Overdue Items</p>
              <h3 style={{ color: hasOverdue ? "#fb7185" : "#f8fafc" }}>
                {overdueIssues.length}
              </h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">💰</div>
            <div className="stat-info" title="Current unpaid overdue fine at ₹5/day">
              <p>Pending Fine</p>
              <h3 style={{ color: pendingFine > 0 ? "#fb923c" : "#10b981" }}>
                ₹{pendingFine}
              </h3>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs">
          {[
            { key: "mycollection", label: `📖 My Active Loans (${activeIssues.length})` },
            { key: "browse", label: "📚 Discover & Borrow" },
            { key: "readingroom", label: "👓 Digital Reading Room" },
            { key: "history", label: `📜 Loan History (${returnedIssues.length})` },
            { key: "chatbot", label: "🤖 AI Assistant" },
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

        {/* ═══════════════ TAB 1: MY ACTIVE LOANS & RENEWALS ═══════════════ */}
        {activeTab === "mycollection" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>📖 My Active Borrowings & Renewals</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Online renewals extend your due date by 14 days (up to 2 times). Overdue items must be returned in person.
                </p>
              </div>
              {overdueIssues.length > 0 && (
                <span className="badge red">⚠️ {overdueIssues.length} Book(s) Overdue</span>
              )}
            </div>

            <div className="list">
              {activeIssues.map((issue) => {
                const book = issue.bookId || {};
                const due = getDueStatus(issue.dueDate, issue.returnDate);
                const daysOverdue = due.daysLeft !== null && due.daysLeft < 0 ? Math.abs(due.daysLeft) : 0;
                const estimatedFine = daysOverdue * 5;
                const renewalsUsed = issue.renewCount || 0;
                const canRenew = renewalsUsed < 2 && daysOverdue === 0;

                return (
                  <div
                    className={`item ${due.cls === "red" ? "overdue-item" : ""}`}
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
                          {book.author} · <span className="badge gray">{book.category}</span>
                        </p>
                        <p className="meta" style={{ marginTop: 4 }}>
                          Borrowed: {new Date(issue.issueDate).toLocaleDateString("en-IN")} &nbsp;|&nbsp;
                          <strong>Due: {new Date(issue.dueDate).toLocaleDateString("en-IN")}</strong>
                        </p>

                        <div className="renewal-status-row" style={{ marginTop: 6, display: "flex", gap: 10, alignItems: "center" }}>
                          <span className="renewal-chip">
                            🔄 Renewals: {renewalsUsed} / 2 used
                          </span>
                          {estimatedFine > 0 && (
                            <span className="fine-badge">
                              💰 Accrued Fine: ₹{estimatedFine}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="item-actions">
                      <span className={`badge ${due.cls}`}>{due.emoji} {due.label}</span>

                      {/* 1-Click Digital Reader Launch */}
                      <button
                        type="button"
                        className="sm reader-launch-btn"
                        onClick={() => setReadingBook(book)}
                        title="Read full digital chapters"
                      >
                        📖 Read Online
                      </button>

                      {/* Online Loan Renewal */}
                      <button
                        type="button"
                        disabled={!canRenew || renewingId === issue._id}
                        onClick={() => handleRenew(issue._id)}
                        className={`sm ${canRenew ? "primary" : "ghost"}`}
                        title={
                          daysOverdue > 0
                            ? "Overdue books cannot be renewed online"
                            : renewalsUsed >= 2
                            ? "Maximum renewals (2/2) reached"
                            : "Extend loan by 14 days"
                        }
                      >
                        {renewingId === issue._id
                          ? "Renewing..."
                          : renewalsUsed >= 2
                          ? "Max Renewed (2/2)"
                          : "🔄 Renew (+14d)"}
                      </button>

                      {/* Return Book */}
                      <button
                        onClick={() => handleReturn(issue._id)}
                        className="sm ghost"
                        title="Return physical copy to library"
                        style={{ color: "#94a3b8" }}
                      >
                        Return
                      </button>
                    </div>
                  </div>
                );
              })}

              {activeIssues.length === 0 && (
                <div className="empty-state">
                  <div className="icon">📚</div>
                  <h3>No Active Borrowings</h3>
                  <p>You currently have no books issued. Explore our catalog to borrow titles.</p>
                  <button
                    type="button"
                    className="sm primary"
                    style={{ marginTop: 12 }}
                    onClick={() => setActiveTab("browse")}
                  >
                    Browse Available Books
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 2: DISCOVER & BORROW ═══════════════ */}
        {activeTab === "browse" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>📚 Explore Library Repository</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Search titles, inspect publications, or claim copies with one-click instant issue.
                </p>
              </div>
              <span className="badge blue">{books.length} titles available</span>
            </div>

            <div className="search-row" style={{ marginBottom: 18 }}>
              <input
                placeholder="🔍 Search title, author, or ISBN..."
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
                const isIssued = alreadyIssuedIds.has(book._id.toString());
                const qtyClass =
                  book.quantity === 0
                    ? "empty"
                    : book.quantity <= 2
                    ? "low"
                    : "available";

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
                        </p>
                        {book.description && (
                          <p
                            className="meta"
                            style={{ marginTop: 4, color: "var(--text-muted)" }}
                          >
                            {book.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="item-actions">
                      <span className={`quantity-badge ${qtyClass}`}>
                        {book.quantity} copies
                      </span>

                      <button
                        type="button"
                        className="sm ghost"
                        onClick={() => setReadingBook(book)}
                        title="Read digital chapters"
                      >
                        📖 Read
                      </button>

                      {isIssued ? (
                        <span className="badge purple" title="Book is in your collection">
                          ✓ Borrowed
                        </span>
                      ) : (
                        <button
                          disabled={book.quantity <= 0 || activeIssues.length >= 3}
                          onClick={() => handleIssue(book._id)}
                          className="sm primary"
                          title={
                            activeIssues.length >= 3
                              ? "Maximum borrow limit (3 books) reached"
                              : book.quantity <= 0
                              ? "Out of Stock"
                              : "Issue book for 14 days"
                          }
                        >
                          {book.quantity <= 0
                            ? "Out of Stock"
                            : activeIssues.length >= 3
                            ? "Limit Reached"
                            : "Borrow Book"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {books.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="icon">📭</div>
                  <p>No titles match your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 3: DIGITAL READING ROOM ═══════════════ */}
        {activeTab === "readingroom" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>👓 Digital Reading Room & Saved Bookmarks</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Resume reading your active and archived textbooks with saved chapters and progress.
                </p>
              </div>
            </div>

            <div className="reading-room-grid">
              {activeIssues.map((issue) => {
                const book = issue.bookId || {};
                return (
                  <div key={issue._id} className="reading-room-card">
                    <div
                      className="room-cover-stripe"
                      style={{ backgroundColor: book.coverColor || "#4f8cff" }}
                    />
                    <div className="room-card-body">
                      <span className="room-genre">{book.category}</span>
                      <h4>{book.title}</h4>
                      <p className="room-author">by {book.author}</p>
                      <button
                        onClick={() => setReadingBook(book)}
                        className="btn-resume-reading"
                      >
                        📖 Continue Reading
                      </button>
                    </div>
                  </div>
                );
              })}

              {activeIssues.length === 0 && (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                  <div className="icon">👓</div>
                  <h3>Your Reading Desk is Clear</h3>
                  <p>Borrow a book or explore the catalog to start reading digital chapters.</p>
                  <button
                    onClick={() => setActiveTab("browse")}
                    className="sm primary"
                    style={{ marginTop: 12 }}
                  >
                    Find Books to Read
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 4: LOAN HISTORY ═══════════════ */}
        {activeTab === "history" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>📜 Completed Loans & Archives</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Historical record of all books returned and completed.
                </p>
              </div>
              <span className="badge green">{returnedIssues.length} completed</span>
            </div>

            <div className="list">
              {returnedIssues.map((issue) => {
                const book = issue.bookId || {};
                return (
                  <div className="item" key={issue._id}>
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
                        <p className="meta">{book.author} · {book.category}</p>
                        <p className="meta">
                          Issued: {new Date(issue.issueDate).toLocaleDateString("en-IN")} &nbsp;→&nbsp;
                          Returned: {new Date(issue.returnDate).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        type="button"
                        className="sm ghost"
                        onClick={() => setReadingBook(book)}
                      >
                        📖 Read Again
                      </button>
                      <span className="badge green">✓ Returned</span>
                      {issue.fine > 0 && (
                        <span className="fine-badge">💰 Settled Fine: ₹{issue.fine}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {returnedIssues.length === 0 && (
                <div className="empty-state">
                  <div className="icon">📜</div>
                  <p>No borrowing history recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 5: AI CHATBOT ASSISTANT ═══════════════ */}
        {activeTab === "chatbot" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>🤖 Intelligent Library Assistant</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Verified contextual assistant answering real-time questions about catalog stock and your loans.
                </p>
              </div>
              <span className="badge purple">Verified Session</span>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="chatbot-suggestions-bar">
              <span className="suggestions-label">Try Asking:</span>
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAskChatbot(q)}
                  className="chip-suggestion"
                  disabled={chatLoading}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="chat-box" ref={chatBoxRef}>
              {chatMessages.map((chat, index) => (
                <div className={`chat-row ${chat.role}`} key={`${chat.role}-${index}`}>
                  <div className="chat-bubble">
                    {chat.text.split("\n").map((line, lIdx) => (
                      <span key={lIdx}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-row bot">
                  <div className="chat-bubble thinking">
                    <span>💭 Searching catalog and loan records...</span>
                  </div>
                </div>
              )}
            </div>

            <form
              className="chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAskChatbot();
              }}
            >
              <input
                placeholder="Ask: 'my due dates', 'quantity of Atomic Habits', 'popular books'..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" disabled={chatLoading}>
                {chatLoading ? "..." : "Ask Assistant"}
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default StudentDashboard;
