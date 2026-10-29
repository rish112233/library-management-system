import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand & Mission Column */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand">
              <span className="brand-icon">📚</span>
              <span className="brand-title">Nex<span className="brand-accent">Lib</span></span>
            </Link>
            <p className="footer-desc">
              The next-generation smart library management ecosystem empowering academic institutions, students, and educators with streamlined cataloging, automated circulation, and digital reading.
            </p>
            <div className="system-status-indicator">
              <span className="status-dot-live" />
              <span className="status-text">All Library Services Operational</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/catalog">Browse Live Catalog</Link></li>
              <li><a href="/#features">Key Features</a></li>
              <li><a href="/#how-it-works">Circulation Process</a></li>
              <li><a href="/#faq">Library Guidelines & FAQ</a></li>
            </ul>
          </div>

          {/* Academic Portals Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Portals</h4>
            <ul className="footer-links">
              <li><Link to="/login">Student Sign In</Link></li>
              <li><Link to="/register">Create Student Account</Link></li>
              <li><Link to="/login">Admin Management Console</Link></li>
              <li><Link to="/profile">Account Settings</Link></li>
            </ul>
          </div>

          {/* Hours & Contact Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Campus Library Hours</h4>
            <ul className="footer-hours">
              <li><span>Mon - Fri:</span> <strong>8:00 AM - 10:00 PM</strong></li>
              <li><span>Saturday:</span> <strong>9:00 AM - 7:00 PM</strong></li>
              <li><span>Sunday:</span> <strong>10:00 AM - 5:00 PM</strong></li>
            </ul>
            <div className="footer-contact-info">
              <p>📍 Central Library Complex, Academic Block</p>
              <p>✉️ library-helpdesk@university.edu</p>
              <p>📞 Circulation Desk: Ext. 4410</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright-text">
            © {currentYear} NexLib Smart Library Management System. Crafted for high-performance academic institutions.
          </div>
          <div className="footer-badges">
            <span className="tech-badge">MERN Stack 2.0</span>
            <span className="tech-badge">REST API Verified</span>
            <span className="tech-badge">Role-Based Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
