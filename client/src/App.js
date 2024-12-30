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
import Navbar from "./components/NavBar";
import RegisterUser from "./components/RegisterUser";

// Move the routes to a separate component that's wrapped by AuthProvider
const AppRoutes = () => {
  const { auth, logout } = useAuth();
  const Layout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate("/");
    };

    return (
      <>
        <Navbar />
        <Outlet />
      </>
    );
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
          path="/users/new"
          element={auth ? <RegisterUser /> : <Navigate to="/" />}
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
