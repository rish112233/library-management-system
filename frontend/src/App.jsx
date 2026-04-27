import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

const getAuthState = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return { token, role, isLoggedIn: Boolean(token && role) };
};

const getHomeRoute = () => {
  const { role } = getAuthState();
  return role === "admin" ? "/admin" : "/student";
};

function ProtectedRoute({ children, role }) {
  const { token, role: userRole } = getAuthState();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={getHomeRoute()} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isLoggedIn } = getAuthState();
  if (isLoggedIn) {
    return <Navigate to={getHomeRoute()} replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
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
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          getAuthState().isLoggedIn ? (
            <Navigate to={getHomeRoute()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
