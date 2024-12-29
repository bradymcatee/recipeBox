import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/recipes">
          Recipe Box
        </Link>
        <div className="d-flex">
          {auth && auth.user ? (
            <>
              <span className="navbar-text me-3">
                {auth.user.firstName} ({auth.user.role})
              </span>
              {auth.user.role === "admin" && (
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => navigate("/users")}
                >
                  Manage Users
                </button>
              )}
              <button
                className="btn btn-outline-secondary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="btn btn-outline-secondary" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
