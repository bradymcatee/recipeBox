// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
      // Add token to axios defaults
      axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
    } else {
      localStorage.removeItem("auth");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [auth]);

  const login = (authData) => setAuth(authData);
  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
