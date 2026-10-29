import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function NotFound() {
  return (
    <div className="error-page-root">
      <Navbar />
      <main className="error-content-box">
        <div className="error-visual-icon">🔍</div>
        <span className="error-code-badge">404 Page Not Found</span>
        <h1 className="error-title">Looking for a Missing Volume?</h1>
        <p className="error-desc">
          The shelf or URL you are trying to visit does not exist or may have been relocated in the latest library reorganization.
        </p>

        <div className="error-actions-group">
          <Link to="/" className="btn-hero-primary">
            ← Return to Homepage
          </Link>
          <Link to="/catalog" className="btn-hero-secondary">
            Search Full Catalog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
