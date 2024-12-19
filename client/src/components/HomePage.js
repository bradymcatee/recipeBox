// src/components/HomePage.js
import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h1 className="mb-4">Recipe Box</h1>
          <p className="mb-4">Manage your restaurant's recipes with ease</p>

          <div className="d-grid gap-3">
            <Link to="/login" className="btn btn-primary btn-lg">
              Login
            </Link>
            <Link
              to="/register-admin"
              className="btn btn-outline-primary btn-lg"
            >
              Register New Restaurant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
