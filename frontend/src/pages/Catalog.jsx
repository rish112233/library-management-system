import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import BookReaderModal from "../components/BookReaderModal";

function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Digital Reader modal state
  const [selectedBookForReader, setSelectedBookForReader] = useState(null);

  // User state
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const isStudent = Boolean(token && role === "student");

  // User issued books tracking
  const [userIssuedBookIds, setUserIssuedBookIds] = useState(new Set());
  const [issuingId, setIssuingId] = useState(null);
  const [issueMessage, setIssueMessage] = useState({ text: "", type: "" });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/analytics/categories");
        if (Array.isArray(res.data)) {
          setCategories(res.data.map((c) => c._id));
        }
      } catch (err) {
        console.warn("Could not load categories:", err.message);
      }
    };
    fetchCategories();
  }, []);

  // Load user's active issues if logged in as student
  useEffect(() => {
    if (!isStudent || !userId) return;
    const fetchUserIssues = async () => {
      try {
        const res = await API.get(`/issues/user/${userId}`);
        const activeIds = new Set(
          res.data
            .filter((issue) => !issue.returnDate)
            .map((issue) => (issue.bookId?._id || issue.bookId).toString())
        );
        setUserIssuedBookIds(activeIds);
      } catch (err) {
        console.warn("Could not load user issues:", err.message);
      }
    };
    fetchUserIssues();
  }, [isStudent, userId]);

  // Fetch books with filters
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          page,
          limit: 12,
          sort,
        };
        if (search.trim()) params.search = search.trim();
        if (category !== "all") params.category = category;
        if (availableOnly) params.availableOnly = "true";

        const res = await API.get("/books", { params });
        setBooks(res.data.books || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      } catch (err) {
        setError("Failed to load catalog books. Please ensure backend server is operational.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchBooks, 250);
    return () => clearTimeout(timer);
  }, [search, category, sort, availableOnly, page]);

  // Handle issue book
  const handleIssueBook = async (bookId) => {
    if (!isStudent) {
      alert("Please log in as a student to borrow books.");
      return;
    }

    setIssuingId(bookId);
    setIssueMessage({ text: "", type: "" });
    try {
      await API.post("/issues", { userId, bookId });
      setUserIssuedBookIds((prev) => new Set(prev).add(bookId.toString()));
      // Decrement quantity locally
      setBooks((prev) =>
        prev.map((b) => (b._id === bookId ? { ...b, quantity: Math.max(0, b.quantity - 1) } : b))
      );
      setIssueMessage({
        text: "Book issued successfully! Track your due date in the Student Portal.",
        type: "success",
      });
      setTimeout(() => setIssueMessage({ text: "", type: "" }), 5000);
    } catch (err) {
      setIssueMessage({
        text: err.response?.data?.message || "Failed to issue book. Please check limits.",
        type: "error",
      });
      setTimeout(() => setIssueMessage({ text: "", type: "" }), 6000);
    } finally {
      setIssuingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("newest");
    setAvailableOnly(false);
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="catalog-page-root">
      <Navbar />

      <main className="catalog-container">
        {/* Page Header */}
        <div className="catalog-header">
          <div className="header-titles">
            <span className="badge-tag">Academic Repository</span>
            <h1>Comprehensive Library Catalog</h1>
            <p>
              Browse and discover over {totalCount} verified academic volumes, technical references, and classics.
            </p>
          </div>
          <div className="header-stats-pill">
            <span className="count-number">{totalCount}</span>
            <span className="count-label">Titles Found</span>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {issueMessage.text && (
          <div className={`catalog-alert ${issueMessage.type}`}>
            <span>{issueMessage.type === "success" ? "✓" : "⚠️"} {issueMessage.text}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="catalog-toolbar">
          <div className="search-input-group">
            <span className="icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="toolbar-search"
            />
            {search && (
              <button onClick={() => setSearch("")} className="clear-btn">
                ✕
              </button>
            )}
          </div>

          <div className="toolbar-controls">
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="toolbar-select"
            >
              <option value="all">All Genres</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="toolbar-select"
            >
              <option value="newest">Recently Added</option>
              <option value="popular">Most Popular</option>
              <option value="title">Alphabetical (A - Z)</option>
              <option value="year">Publication Year</option>
              <option value="available">Highest Availability</option>
            </select>

            {/* Available Only Toggle */}
            <label className="available-toggle-label">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => {
                  setAvailableOnly(e.target.checked);
                  setPage(1);
                }}
              />
              <span>In-Stock Only</span>
            </label>

            {/* Reset Button */}
            {(search || category !== "all" || availableOnly || sort !== "newest") && (
              <button onClick={handleResetFilters} className="btn-reset-filters">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="loading-state-box">
            <div className="spinner-orbit" />
            <p>Loading catalog items from repository...</p>
          </div>
        ) : error ? (
          <div className="error-state-box">
            <p>⚠️ {error}</p>
            <button onClick={handleResetFilters} className="btn-retry">
              Retry Search
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state-box">
            <span className="empty-icon">🔍</span>
            <h3>No matching books found</h3>
            <p>We couldn't find any titles matching your filter criteria.</p>
            <button onClick={handleResetFilters} className="btn-retry">
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="catalog-grid">
              {books.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onRead={(b) => setSelectedBookForReader(b)}
                  onIssue={isStudent ? handleIssueBook : null}
                  isIssued={userIssuedBookIds.has(book._id.toString())}
                  issuing={issuingId === book._id}
                />
              ))}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Digital Book Reader Modal */}
      {selectedBookForReader && (
        <BookReaderModal
          book={selectedBookForReader}
          onClose={() => setSelectedBookForReader(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default Catalog;
