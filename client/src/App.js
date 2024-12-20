import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import RegisterAdmin from "./components/RegisterAdmin";
import RecipesTable from "./components/RecipesTable";
import RecipeForm from "./components/RecipeForm";
import RecipeDetails from "./components/RecipeCard";
import UsersTable from "./components/UsersTable";

// Move the routes to a separate component that's wrapped by AuthProvider
const AppRoutes = () => {
  const { auth, logout } = useAuth();

  const Layout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate("/");
    };

    if (auth && auth.user.role === "admin") {
      return (
        <>
          (
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
              <Link className="navbar-brand" to="/recipes">
                Recipe Box
              </Link>
              <div className="d-flex">
                <span className="navbar-text me-3">
                  {auth.user.firstName} ({auth.user.role})
                </span>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => navigate("/users")}
                >
                  Manage Users
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
          )
          <Outlet />
        </>
      );
    } else {
      return (
        <>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
              <Link className="navbar-brand" to="/recipes">
                Recipe Box
              </Link>
              <div className="d-flex">
                <span className="navbar-text me-3">
                  {auth.user.firstName} ({auth.user.role})
                </span>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
          <Outlet />
        </>
      );
    }
  };
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route
          path="/"
          element={auth ? <Navigate to="/recipes" /> : <HomePage />}
        />
        <Route
          path="/login"
          element={auth ? <Navigate to="/recipes" /> : <Login />}
        />
        <Route
          path="/register-admin"
          element={auth ? <Navigate to="/recipes" /> : <RegisterAdmin />}
        />

        {/* Protected Routes */}
        <Route
          path="/users"
          element={auth ? <UsersTable /> : <Navigate to="/" />}
        />
        <Route
          path="/recipes"
          element={auth ? <RecipesTable /> : <Navigate to="/" />}
        />
        <Route
          path="/recipes/new"
          element={auth ? <RecipeForm /> : <Navigate to="/" />}
        />
        <Route
          path="/recipes/edit/:id"
          element={auth ? <RecipeForm /> : <Navigate to="/" />}
        />
        <Route
          path="/recipe/:id"
          element={auth ? <RecipeDetails /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
