import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Catalog from "./pages/Catalog";
import BookDetails from "./pages/BookDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const getAuthState = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return { token, role, isLoggedIn: Boolean(token && role) };
};

const getHomeRoute = () => {
  const { role } = getAuthState();
  return role === "admin" ? "/admin" : "/student";
};

// Route requiring authentication and optionally a specific role
function ProtectedRoute({ children, role }) {
  const { token, role: userRole } = getAuthState();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Route accessible only when NOT authenticated (login, register)
function GuestOnlyRoute({ children }) {
  const { isLoggedIn } = getAuthState();
  if (isLoggedIn) {
    return <Navigate to={getHomeRoute()} replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      {/* 1. Public Homepage */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Public Catalog & Dedicated Book Details */}
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/books/:id" element={<BookDetails />} />

      {/* 3. Guest Auth Routes */}
      <Route
        path="/login"
        element={
          <GuestOnlyRoute>
            <Login />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnlyRoute>
            <Register />
          </GuestOnlyRoute>
        }
      />

      {/* 4. Authenticated Profile & Security */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* 5. Role-Protected Portals */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 6. Error & Fallback States */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
