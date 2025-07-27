import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext"; // Import SocketProvider
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster for sonner toasts

// Import modular pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Loans from "./pages/Loans";
import Savings from "./pages/Savings";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Groups from "./pages/Groups"; // Ensure Groups is imported
import Meetings from "./pages/Meetings"; // Ensure Meetings is imported
import Chat from "./pages/Chat"; // Import the Chat component

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  // If user is not authenticated, redirect to login page
  return user ? children : <Navigate to="/login" replace />;
}

// Main App Component - Only handles routing and layout
export default function App() {
  return (
    // ThemeProvider wraps the entire app to provide theme context
    <ThemeProvider>
      {/* AuthProvider wraps the app to provide authentication context */}
      <AuthProvider>
        {/* SocketProvider wraps the protected routes to provide real-time functionality */}
        <SocketProvider>
          {/* Router for client-side routing */}
          <Router>
            {/* Routes define application paths and their corresponding components */}
            <Routes>
              {/* Public routes for authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes that require authentication */}
              {/* The 'element' prop on the parent Route renders MainLayout if authenticated.
                  Nested Routes within it will render their components into MainLayout's <Outlet />. */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* Specific protected routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/members" element={<Members />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/savings" element={<Savings />} />
                {/* CORRECTED: Removed duplicate 'element' prop */}
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />

                {/* Default redirect for the root path to dashboard if authenticated */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Route>

              {/* Catch-all route for any undefined paths, redirects to dashboard if authenticated */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
        {/* Toaster component for displaying toast notifications across the app */}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
