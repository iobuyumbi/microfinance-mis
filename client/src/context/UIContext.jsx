import React, { createContext, useContext, useState } from "react";

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const value = {
    sidebarOpen,
    theme,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    toggleTheme,
    setTheme,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
