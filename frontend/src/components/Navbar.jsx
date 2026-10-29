import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar({ hasOverdue = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "User";
  const isLoggedIn = Boolean(token && role);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleEmoji = role === "admin" ? "🛡️" : "🎓";
  const dashboardPath = role === "admin" ? "/admin" : "/student";

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Catalog", path: "/catalog" },
    { label: "Features", path: "/#features" },
    { label: "How It Works", path: "/#how-it-works" },
    { label: "FAQ", path: "/#faq" },
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path.startsWith("/#")) {
      if (location.pathname !== "/") {
        navigate("/" + path.replace("/", ""));
      } else {
        const id = path.replace("/#", "");
        const elem = document.getElementById(id);
        if (elem) elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className={`navbar-wrapper ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <span>📚</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">Nex<span className="brand-accent">Lib</span></span>
            <span className="brand-subtitle">Smart Library Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = link.path === "/" ? location.pathname === "/" : location.pathname.startsWith(link.path);
            if (link.path.startsWith("/#")) {
              return (
                <a
                  key={link.label}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.path);
                  }}
                  className={`nav-link ${location.pathname === "/" && location.hash === link.path.replace("/", "") ? "active" : ""}`}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <div className="user-nav-group">
              <Link to={dashboardPath} className="btn-portal" title="Open Your Dashboard">
                <span className="portal-icon">{roleEmoji}</span>
                <span className="portal-text">{role === "admin" ? "Admin Console" : "My Books"}</span>
                {hasOverdue && <span className="pulse-dot" title="Overdue book alerts" />}
              </Link>

              <Link to="/profile" className="profile-pill" title="Profile Settings">
                <div className="avatar-chip">{initials}</div>
                <span className="user-name-label">{name.split(" ")[0]}</span>
              </Link>

              <button onClick={handleLogout} className="btn-logout" title="Sign out of account">
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-nav-group">
              <Link to="/login" className="btn-text-login">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary-register">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`} />
            <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`} />
            <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  if (link.path.startsWith("/#")) {
                    handleNavClick(link.path);
                  } else {
                    setMobileMenuOpen(false);
                    navigate(link.path);
                  }
                }}
                className="mobile-nav-item"
              >
                {link.label}
              </a>
            ))}

            <div className="mobile-drawer-divider" />

            {isLoggedIn ? (
              <>
                <Link to={dashboardPath} className="mobile-drawer-btn primary" onClick={() => setMobileMenuOpen(false)}>
                  {roleEmoji} Go to {role === "admin" ? "Admin Dashboard" : "Student Portal"}
                </Link>
                <Link to="/profile" className="mobile-drawer-btn" onClick={() => setMobileMenuOpen(false)}>
                  👤 Profile & Account
                </Link>
                <button onClick={handleLogout} className="mobile-drawer-btn danger">
                  🚪 Sign Out ({name})
                </button>
              </>
            ) : (
              <div className="mobile-guest-buttons">
                <Link to="/login" className="mobile-drawer-btn" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="mobile-drawer-btn primary" onClick={() => setMobileMenuOpen(false)}>
                  Register New Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
