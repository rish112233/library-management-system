import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";

function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [bookError, setBookError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const userRole = localStorage.getItem("role");

  // Fetch live stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/analytics/public");
        setStats(res.data);
        if (res.data.popularBooks) {
          setPopularBooks(res.data.popularBooks);
        }
        if (res.data.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.warn("Could not load public stats:", err.message);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch featured books from backend with live search and category
  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingBooks(true);
      setBookError("");
      try {
        const params = { limit: 8 };
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await API.get("/books", { params });
        setFeaturedBooks(res.data.books || []);
      } catch (err) {
        setBookError("Unable to retrieve catalog at this moment. Please check server connection.");
      } finally {
        setLoadingBooks(false);
      }
    };

    const debounceTimer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/catalog");
    }
  };

  const faqs = [
    {
      q: "How many books can a student borrow concurrently?",
      a: "Undergraduate and postgraduate students can borrow up to 3 physical books simultaneously for a standard loan period of 14 days.",
    },
    {
      q: "Can I renew my borrowed books online?",
      a: "Yes! Active loans can be renewed up to 2 consecutive times through the Student Portal, extending your due date by 14 days, provided the book is not currently overdue.",
    },
    {
      q: "How does the digital e-Reader work?",
      a: "Every verified book with digital chapters can be read directly in your browser with adjustable typography, font sizing, and custom themes (Light, Dark, and Sepia). Your reading progress is tracked in real-time.",
    },
    {
      q: "What is the overdue fine policy?",
      a: "A nominal fine of ₹5 per day is accrued after the due date passes. Accumulated fines can be settled at the central library desk during business hours.",
    },
    {
      q: "How do I ask the AI Library Assistant questions?",
      a: "Once logged into your Student Portal, open the Smart Assistant panel to ask natural language questions in English or Hinglish about book availability, your upcoming due dates, and fine calculations.",
    },
  ];

  const features = [
    {
      icon: "⚡",
      title: "Instant Circulation",
      desc: "One-click digital borrowing and automated renewals with zero manual paperwork.",
    },
    {
      icon: "📖",
      title: "Interactive E-Reader",
      desc: "Immersive multi-theme reader with font scaling, chapter markers, and reading position tracking.",
    },
    {
      icon: "🤖",
      title: "Intelligent Assistant",
      desc: "Conversational query bot providing instant answers on book stock, loans, and due dates.",
    },
    {
      icon: "📊",
      title: "Real-Time Analytics",
      desc: "Data-driven circulation metrics, category breakdowns, and overdue alerts for administrators.",
    },
    {
      icon: "🛡️",
      title: "Role-Based Security",
      desc: "Enterprise JWT auth, salted hashing, and isolated permission boundaries for staff and scholars.",
    },
    {
      icon: "📱",
      title: "Responsive Anywhere",
      desc: "Engineered to deliver an uncompromising experience across mobile, tablet, and widescreen monitors.",
    },
  ];

  return (
    <div className="landing-page-root">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-sphere top-left" />
        <div className="hero-glow-sphere bottom-right" />
        
        <div className="hero-container">
          <div className="hero-badge-pill">
            <span className="badge-sparkle">✨</span>
            <span>Next-Gen Academic Library Management System</span>
          </div>

          <h1 className="hero-headline">
            Where Modern Technology <br />
            <span className="gradient-text">Meets Timeless Knowledge</span>
          </h1>

          <p className="hero-description">
            Streamline your academic journey with instant book discovery, frictionless digital circulation, interactive chapter readers, and an automated intelligent assistant.
          </p>

          {/* Search bar inside hero */}
          <form onSubmit={handleHeroSearch} className="hero-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title, author, category, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="hero-search-btn">
              Search Catalog
            </button>
          </form>

          {/* Action CTAs */}
          <div className="hero-cta-group">
            <Link to="/catalog" className="btn-hero-primary">
              Explore Live Catalog
              <span className="arrow-icon">→</span>
            </Link>
            {isLoggedIn ? (
              <Link
                to={userRole === "admin" ? "/admin" : "/student"}
                className="btn-hero-secondary"
              >
                Go to {userRole === "admin" ? "Admin Console" : "Student Portal"}
              </Link>
            ) : (
              <Link to="/login" className="btn-hero-secondary">
                Student Sign In
              </Link>
            )}
          </div>

          {/* Live System Counter Bar */}
          <div className="hero-stats-banner">
            <div className="stat-card">
              <span className="stat-number">
                {loadingStats ? "..." : (stats?.totalBooks || 0)}
              </span>
              <span className="stat-label">Unique Titles</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <span className="stat-number">
                {loadingStats ? "..." : (stats?.totalCopies || 0)}
              </span>
              <span className="stat-label">Total Volumes</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <span className="stat-number">
                {loadingStats ? "..." : (stats?.activeCirculation || 0)}
              </span>
              <span className="stat-label">Active Loans</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-card">
              <span className="stat-number">
                {loadingStats ? "..." : (stats?.totalStudents || 0)}
              </span>
              <span className="stat-label">Registered Scholars</span>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Bar */}
      <section className="announcement-bar">
        <div className="announcement-content">
          <span className="announcement-tag">📢 Campus Notice</span>
          <span className="announcement-text">
            Digital chapter reading is now enabled for all computer science and foundational literature collections. Fall semester loans are active!
          </span>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="featured-books-section" id="catalog">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-subtitle">Live Inventory</span>
              <h2 className="section-title">Explore Featured Collections</h2>
              <p className="section-desc">
                Real-time availability directly synced with our central library database.
              </p>
            </div>
            <Link to="/catalog" className="view-all-link">
              View Full Catalog ({stats?.totalBooks || "20+"} books) →
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filter-bar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`category-pill ${selectedCategory === "all" ? "active" : ""}`}
            >
              All Genres
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Book Grid */}
          {loadingBooks ? (
            <div className="loading-state-box">
              <div className="spinner-orbit" />
              <p>Fetching real-time inventory from library database...</p>
            </div>
          ) : bookError ? (
            <div className="error-state-box">
              <p>⚠️ {bookError}</p>
              <button onClick={() => setSelectedCategory("all")} className="btn-retry">
                Reset Filters
              </button>
            </div>
          ) : featuredBooks.length === 0 ? (
            <div className="empty-state-box">
              <span className="empty-icon">📚</span>
              <h3>No books found</h3>
              <p>Try searching for a different title, author, or category.</p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="btn-retry"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="books-showcase-grid">
              {featuredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header centered">
            <span className="section-subtitle">Why NexLib</span>
            <h2 className="section-title">Engineered for Academic Excellence</h2>
            <p className="section-desc">
              Everything modern libraries need to serve researchers, students, and campus administrators seamlessly.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-wrapper">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header centered">
            <span className="section-subtitle">Simple 3-Step Workflow</span>
            <h2 className="section-title">How Digital Circulation Works</h2>
            <p className="section-desc">
              Experience the seamless lifecycle of academic borrowing from search to return.
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-badge">1</div>
              <div className="step-content">
                <h3>Discover & Inspect</h3>
                <p>
                  Browse our real-time indexed catalog with instant genre filtering, ISBN lookup, and stock availability metrics.
                </p>
              </div>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-badge">2</div>
              <div className="step-content">
                <h3>Borrow or Read Online</h3>
                <p>
                  Claim physical copies with one-click digital issue or read digital chapters immediately in the integrated reader.
                </p>
              </div>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-badge">3</div>
              <div className="step-content">
                <h3>Track & Renew</h3>
                <p>
                  Monitor due dates in your personal dashboard, receive overdue alerts, and execute online renewals with ease.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Titles Highlight Banner */}
      {popularBooks.length > 0 && (
        <section className="popular-strip-section">
          <div className="section-container">
            <div className="popular-strip-header">
              <h3>🏆 Most Circulated Titles Across Campus</h3>
              <Link to="/catalog?sort=popular" className="popular-link">
                View Leaderboard →
              </Link>
            </div>
            <div className="popular-chips-scroller">
              {popularBooks.map((pb) => (
                <Link key={pb._id} to={`/books/${pb._id}`} className="popular-chip">
                  <span className="chip-cover" style={{ backgroundColor: pb.coverColor || "#4f8cff" }} />
                  <span className="chip-title">{pb.title}</span>
                  <span className="chip-count">🔥 {pb.issueCount || 0} loans</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Student Benefits Section */}
      <section className="benefits-section">
        <div className="section-container">
          <div className="benefits-grid">
            <div className="benefits-text-col">
              <span className="section-subtitle">Student Benefits</span>
              <h2 className="section-title">Accelerate Your Academic Research</h2>
              <p className="section-desc">
                NexLib is designed to eliminate paperwork so you can dedicate all your energy to discovery, learning, and research.
              </p>
              <ul className="benefits-list">
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>24/7 Digital Reading Room:</strong>
                    <span> Access curated textbook chapters and references on any device anytime.</span>
                  </div>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Proactive Due Date Reminders:</strong>
                    <span> Visual color-coded indicators prevent overdue fines before they accrue.</span>
                  </div>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>Online 14-Day Loan Extensions:</strong>
                    <span> Renew eligible books without having to visit the physical desk.</span>
                  </div>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <div>
                    <strong>AI Research Companion:</strong>
                    <span> Get instant answers regarding book availability, genres, and loans.</span>
                  </div>
                </li>
              </ul>
              <div className="benefits-cta">
                <Link to="/register" className="btn-hero-primary">
                  Create Student Account
                </Link>
              </div>
            </div>

            <div className="benefits-visual-col">
              <div className="benefits-card-preview">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <span className="preview-title">Student Dashboard Live Preview</span>
                </div>
                <div className="preview-body">
                  <div className="preview-metric-row">
                    <div className="preview-metric">
                      <span className="val">2</span>
                      <span className="lbl">Active Loans</span>
                    </div>
                    <div className="preview-metric">
                      <span className="val">9 Days</span>
                      <span className="lbl">Next Due Date</span>
                    </div>
                    <div className="preview-metric">
                      <span className="val">₹0</span>
                      <span className="lbl">Pending Fines</span>
                    </div>
                  </div>
                  <div className="preview-loan-item">
                    <span className="book-ico">📘</span>
                    <div className="book-meta">
                      <strong>Clean Code</strong>
                      <small>Robert C. Martin • Due in 9 days</small>
                    </div>
                    <span className="status-badge-green">Active</span>
                  </div>
                  <div className="preview-loan-item">
                    <span className="book-ico">📙</span>
                    <div className="book-meta">
                      <strong>Atomic Habits</strong>
                      <small>James Clear • Due in 12 days</small>
                    </div>
                    <span className="status-badge-green">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="faq-section" id="faq">
        <div className="section-container narrow">
          <div className="section-header centered">
            <span className="section-subtitle">Clear Guidelines</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc">
              Everything you need to know about circulation guidelines, digital reading, and renewals.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? "expanded" : ""}`}
                onClick={() => toggleFaq(index)}
              >
                <button className="faq-question" aria-expanded={openFaq === index}>
                  <span>{faq.q}</span>
                  <span className="faq-toggle-icon">{openFaq === index ? "−" : "+"}</span>
                </button>
                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA Strip */}
      <section className="cta-banner-section">
        <div className="section-container">
          <div className="cta-banner-box">
            <div className="cta-content">
              <h2>Ready to explore our vast academic collection?</h2>
              <p>
                Join thousands of students and faculty leveraging NexLib for seamless reading and research.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/register" className="btn-cta-white">
                Register as Student
              </Link>
              <Link to="/catalog" className="btn-cta-translucent">
                Browse Full Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
