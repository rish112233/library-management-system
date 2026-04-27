import { useNavigate } from "react-router-dom";

function Navbar({ title }) {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div>
        <h2>{title}</h2>
        <p>
          {name} ({role})
        </p>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;
