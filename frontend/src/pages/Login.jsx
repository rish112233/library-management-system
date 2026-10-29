import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", { email, password });
      const { token, role, userId, name } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      localStorage.setItem("name", name);

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="auth-page-root">
      <Navbar />

      <main className="auth-container">
        <div className="card login-card auth-box">
          <div className="auth-header">
            <div className="auth-icon-badge">📚</div>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">
              Sign in to manage your borrowings, access reading materials, or administer catalog inventory.
            </p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-field-group">
              <label>Institutional Email</label>
              <input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-field-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? "Authenticating..." : "Sign In to Portal"}
            </button>
          </form>

          {message && (
            <p className="auth-feedback-msg error">
              {message}
            </p>
          )}

          {/* Quick Demo Credentials for Reviewers */}
          <div className="demo-credentials-box">
            <span className="demo-badge">Evaluator Quick Fill</span>
            <div className="demo-buttons">
              <button
                type="button"
                onClick={() => fillCredentials("student@lms.com", "student123")}
                className="btn-demo-fill"
              >
                🎓 Student Account
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("admin@lms.com", "admin123")}
                className="btn-demo-fill"
              >
                🛡️ Admin Account
              </button>
            </div>
          </div>

          <div className="auth-footer-prompt">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
