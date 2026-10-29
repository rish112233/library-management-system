import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await API.post("/auth/register", formData);
      const { token, role, userId, name } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userId);
        localStorage.setItem("name", name);
        navigate("/student");
      } else {
        navigate("/login");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <Navbar />

      <main className="auth-container">
        <div className="card login-card auth-box">
          <div className="auth-header">
            <div className="auth-icon-badge">📖</div>
            <h2>Join the Digital Library</h2>
            <p className="auth-subtitle">
              Create your official student account to borrow books, track loans, and read online.
            </p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-field-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Rishi Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-field-group">
              <label>Institutional Email</label>
              <input
                type="email"
                name="email"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-field-group">
              <label>Password (minimum 6 characters)</label>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="input-field-group">
              <label>Academic Department</label>
              <input
                type="text"
                name="department"
                placeholder="e.g. Computer Science, Physics, Economics"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="input-field-group">
              <label>Mobile Contact (Optional)</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="auth-security-notice">
              <span>🔒 Registration grants verified Student privileges with access to catalog circulation.</span>
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? "Creating Account..." : "Create Student Account"}
            </button>
          </form>

          {message && (
            <p className={`auth-feedback-msg ${isError ? "error" : "success"}`}>
              {message}
            </p>
          )}

          <div className="auth-footer-prompt">
            Already have an account? <Link to="/login">Sign In here</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Register;
