// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const getMe = async () => {
    const me = await authService.getMe();
    setUser(me);
    return me;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      getMe().catch(() => logout());
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, getMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
