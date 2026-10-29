import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookReaderModal from "../components/BookReaderModal";
import BookCard from "../components/BookCard";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReader, setShowReader] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // User state
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const isStudent = Boolean(token && role === "student");

  // Issue state
  const [isIssued, setIsIssued] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issueAlert, setIssueAlert] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/books/${id}`);
        setBook(res.data);

        // Fetch related books in the same category
        if (res.data?.category) {
          const relatedRes = await API.get("/books", {
            params: { category: res.data.category, limit: 4 },
          });
          const filtered = (relatedRes.data.books || []).filter((b) => b._id !== id);
          setRelatedBooks(filtered.slice(0, 3));
        }

        // Check if student has already issued this book
        if (isStudent && userId) {
          const userIssuesRes = await API.get(`/issues/user/${userId}`);
          const issued = userIssuesRes.data.some(
            (issue) => !issue.returnDate && (issue.bookId?._id || issue.bookId) === id
          );
          setIsIssued(issued);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Book not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, isStudent, userId]);

  const handleIssue = async () => {
    if (!isStudent) {
      navigate("/login");
      return;
    }

    setIssuing(true);
    setIssueAlert({ text: "", type: "" });
    try {
      await API.post("/issues", { userId, bookId: id });
      setIsIssued(true);
      setBook((prev) => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }));
      setIssueAlert({
        text: `Success! "${book.title}" has been issued to your account for 14 days.`,
        type: "success",
      });
    } catch (err) {
      setIssueAlert({
        text: err.response?.data?.message || "Unable to issue book. Please check limits.",
        type: "error",
      });
    } finally {
      setIssuing(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="book-details-root">
        <Navbar />
        <div className="details-container">
          <div className="loading-state-box">
            <div className="spinner-orbit" />
            <p>Loading book publication details and digital chapters...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-details-root">
        <Navbar />
        <div className="details-container">
          <div className="error-state-box">
            <span style={{ fontSize: 48 }}>📖</span>
            <h2>Book Not Found</h2>
            <p>{error || "The requested book could not be located in our catalog."}</p>
            <Link to="/catalog" className="btn-hero-primary" style={{ marginTop: 16 }}>
              ← Return to Catalog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAvailable = (book.quantity || 0) > 0;
  const coverColor = book.coverColor || "#4f8cff";

  return (
    <div className="book-details-root">
      <Navbar />

      <main className="details-container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-nav">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to="/catalog">Catalog</Link>
          <span className="separator">/</span>
          <Link to={`/catalog?category=${encodeURIComponent(book.category)}`}>
            {book.category}
          </Link>
          <span className="separator">/</span>
          <span className="current">{book.title}</span>
        </div>

        {/* Global Feedback Banner */}
        {issueAlert.text && (
          <div className={`catalog-alert ${issueAlert.type}`}>
            <span>{issueAlert.type === "success" ? "✓" : "⚠️"} {issueAlert.text}</span>
          </div>
        )}

        {/* Main Details Showcase Grid */}
        <div className="book-showcase-grid">
          {/* Left Column: 3D Book Cover & Fast Stats */}
          <div className="showcase-cover-col">
            <div className="detail-cover-card" style={{ "--cover-tint": coverColor }}>
              <div className="detail-cover-art" style={{ backgroundColor: coverColor }}>
                <div className="cover-badge">{book.category}</div>
                <h2 className="cover-title">{book.title}</h2>
                <p className="cover-author">{book.author}</p>
                <div className="cover-footer">
                  <span>NexLib Edition</span>
                  {book.publishedYear && <span>{book.publishedYear}</span>}
                </div>
              </div>
            </div>

            <div className="availability-card">
              <div className="avail-header">
                <span>Inventory Status</span>
                {isAvailable ? (
                  <span className="stock-pill in-stock">● In Stock</span>
                ) : (
                  <span className="stock-pill out-of-stock">● Checked Out</span>
                )}
              </div>
              <div className="avail-numbers">
                <div className="num-item">
                  <span className="label">Available Copies</span>
                  <span className="val green">{book.quantity}</span>
                </div>
                <div className="num-divider" />
                <div className="num-item">
                  <span className="label">Total Holdings</span>
                  <span className="val">{book.totalQuantity || book.quantity}</span>
                </div>
                <div className="num-divider" />
                <div className="num-item">
                  <span className="label">Total Loans</span>
                  <span className="val purple">🔥 {book.issueCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Metadata, and CTAs */}
          <div className="showcase-info-col">
            <div className="book-header-box">
              <span className="genre-badge">{book.category}</span>
              <h1 className="detail-title">{book.title}</h1>
              <p className="detail-author">By <span className="author-name">{book.author}</span></p>
            </div>

            {/* Metadata Pills */}
            <div className="metadata-pills-row">
              {book.publishedYear && (
                <div className="meta-pill">
                  <span className="lbl">Published</span>
                  <span className="val">{book.publishedYear}</span>
                </div>
              )}
              {book.isbn && (
                <div className="meta-pill">
                  <span className="lbl">ISBN</span>
                  <span className="val">{book.isbn}</span>
                </div>
              )}
              <div className="meta-pill">
                <span className="lbl">Language</span>
                <span className="val">English</span>
              </div>
              <div className="meta-pill">
                <span className="lbl">Circulation Period</span>
                <span className="val">14 Days</span>
              </div>
            </div>

            {/* Synopsis / Description */}
            <div className="book-synopsis-section">
              <h3>Synopsis & Overview</h3>
              <p className="synopsis-body">
                {book.description ||
                  `"${book.title}" by ${book.author} is a distinguished text in the ${book.category} collection. Available for registered academic borrowing and digital study through the university library system.`}
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="details-actions-group">
              {isStudent ? (
                <button
                  onClick={handleIssue}
                  disabled={!isAvailable || isIssued || issuing}
                  className={`btn-primary-borrow ${isIssued ? "issued" : ""}`}
                >
                  {issuing
                    ? "Issuing Book..."
                    : isIssued
                    ? "✓ Currently Borrowed by You"
                    : isAvailable
                    ? "Borrow This Book"
                    : "Currently Unavailable"}
                </button>
              ) : !token ? (
                <Link to="/login" className="btn-primary-borrow">
                  Sign In to Borrow Book
                </Link>
              ) : null}

              <button
                onClick={() => setShowReader(true)}
                className="btn-read-online"
              >
                📖 Open Digital Reader
              </button>

              <button onClick={handleShare} className="btn-secondary-share">
                {copySuccess ? "✓ Copied!" : "🔗 Share"}
              </button>
            </div>

            {/* Chapters Overview List */}
            <div className="chapters-overview-box">
              <div className="chapters-header">
                <h3>Digital Chapters Included</h3>
                <span className="chapter-count">
                  {book.chapters?.length || 4} Chapters Available
                </span>
              </div>
              <p className="chapters-note">
                Accessible directly through the built-in multi-theme e-Reader.
              </p>
              <div className="chapters-preview-list">
                {(book.chapters?.length > 0
                  ? book.chapters
                  : [
                      { number: 1, title: "Foundations & Core Principles" },
                      { number: 2, title: "Methodologies & Practical Application" },
                      { number: 3, title: "Advanced Frameworks & Deep Dive" },
                      { number: 4, title: "Synthesis, Case Studies & Conclusion" },
                    ]
                ).map((ch, idx) => (
                  <div
                    key={idx}
                    className="chapter-preview-item"
                    onClick={() => setShowReader(true)}
                  >
                    <span className="chapter-num">Ch. {ch.number || idx + 1}</span>
                    <span className="chapter-title">{ch.title}</span>
                    <span className="read-arrow">Read →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <section className="related-books-section">
            <div className="section-header">
              <div>
                <span className="section-subtitle">Related Collection</span>
                <h2 className="section-title">More Books in {book.category}</h2>
              </div>
              <Link to={`/catalog?category=${encodeURIComponent(book.category)}`} className="view-all-link">
                Explore All in {book.category} →
              </Link>
            </div>
            <div className="books-showcase-grid">
              {relatedBooks.map((relBook) => (
                <BookCard key={relBook._id} book={relBook} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Book Reader Modal */}
      {showReader && (
        <BookReaderModal
          book={book}
          onClose={() => setShowReader(false)}
        />
      )}

      <Footer />
    </div>
  );
}

export default BookDetails;
