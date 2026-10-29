import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Unauthorized() {
  const role = localStorage.getItem("role");

  return (
    <div className="error-page-root">
      <Navbar />
      <main className="error-content-box">
        <div className="error-visual-icon">🛡️</div>
        <span className="error-code-badge">403 Forbidden Access</span>
        <h1 className="error-title">Restricted Access Area</h1>
        <p className="error-desc">
          You do not possess the required administrator privileges to access this console. 
          Your request was logged and rejected by server-side authorization controls.
        </p>

        <div className="error-actions-group">
          <Link
            to={role === "student" ? "/student" : "/"}
            className="btn-hero-primary"
          >
            {role === "student" ? "← Return to Student Portal" : "← Return to Homepage"}
          </Link>
          <Link to="/catalog" className="btn-hero-secondary">
            Browse Catalog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Unauthorized;
