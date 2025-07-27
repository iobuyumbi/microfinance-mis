import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";

// Import role-based route protection
import {
  AdminRoute,
  StaffRoute,
  LeaderRoute,
  MemberRoute,
} from "./components/auth/RoleBasedRoute";

// Import layouts
import DynamicLayout from "./components/layouts/DynamicLayout";

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
import Groups from "./pages/Groups";
import Meetings from "./pages/Meetings";
import Chat from "./pages/Chat";
import Users from "./pages/Users";
import LoanAssessment from "./pages/LoanAssessment";

// Import floating chat component
import FloatingChatButton from "./components/chat/FloatingChatButton";

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

              {/* Protected routes with role-based access control */}
              <Route
                element={
                  <MemberRoute>
                    <DynamicLayout />
                  </MemberRoute>
                }
              >
                {/* Routes accessible to all authenticated users */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Settings />} />

                {/* Member-specific routes */}
                <Route path="/my-groups" element={<Groups />} />
                <Route path="/my-loans" element={<Loans />} />
                <Route path="/my-savings" element={<Savings />} />
                <Route path="/my-transactions" element={<Transactions />} />
                <Route path="/meetings" element={<Meetings />} />
              </Route>

              {/* Leader-specific routes */}
              <Route
                element={
                  <LeaderRoute>
                    <DynamicLayout />
                  </LeaderRoute>
                }
              >
                <Route path="/group-management" element={<Groups />} />
                <Route path="/member-management" element={<Members />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Staff/Admin routes */}
              <Route
                element={
                  <StaffRoute>
                    <DynamicLayout />
                  </StaffRoute>
                }
              >
                <Route path="/loans" element={<Loans />} />
                <Route path="/loan-assessment" element={<LoanAssessment />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              {/* Admin-only routes */}
              <Route
                element={
                  <AdminRoute>
                    <DynamicLayout />
                  </AdminRoute>
                }
              >
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Default redirect for the root path */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Catch-all route for any undefined paths, redirects to dashboard if authenticated */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>

          {/* Floating chat button - only show for authenticated users */}
          <FloatingChatButton />
        </SocketProvider>
        {/* Toaster component for displaying toast notifications across the app */}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
