import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      await API.post("/auth/register", formData);
      navigate("/login");
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="page">
      <div className="card login-card">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister} className="form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Register</button>
        </form>

        {message && <p className={isError ? "error" : "success"}>{message}</p>}

        <p className="hint">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
