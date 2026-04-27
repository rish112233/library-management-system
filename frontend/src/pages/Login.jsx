import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

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
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page">
      <div className="card login-card">
        <h2>Library Login</h2>
        <form onSubmit={handleLogin} className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p className="error">{message}</p>}
        <p className="hint">Use a registered account to login.</p>
        <p className="hint">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
