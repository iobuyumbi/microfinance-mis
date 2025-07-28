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
  ProtectedRoute,
} from "./components/auth/RoleBasedRoute";

// Import layouts
import DynamicLayout from "./components/layouts/DynamicLayout";

// Import modular pages
import Landing from "./pages/Landing";
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
import MyGroups from "./pages/MyGroups";
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
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes with role-based access control */}
              <Route
                element={
                  <ProtectedRoute
                    requiredRoles={["admin", "officer", "leader", "member"]}
                  >
                    <DynamicLayout />
                  </ProtectedRoute>
                }
              >
                {/* Routes accessible to all authenticated users */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Settings />} />
                <Route path="/settings" element={<Settings />} />

                {/* Member-specific routes */}
                <Route path="/my-groups" element={<MyGroups />} />
                <Route path="/my-loans" element={<Loans />} />
                <Route path="/my-savings" element={<Savings />} />
                <Route path="/my-transactions" element={<Transactions />} />

                {/* Leader-specific routes (accessible to leaders and above) */}
                <Route
                  path="/meetings"
                  element={
                    <ProtectedRoute
                      requiredRoles={["admin", "officer", "leader"]}
                    >
                      <Meetings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loans"
                  element={
                    <ProtectedRoute
                      requiredRoles={["admin", "officer", "leader"]}
                    >
                      <Loans />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/savings"
                  element={
                    <ProtectedRoute
                      requiredRoles={["admin", "officer", "leader"]}
                    >
                      <Savings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute
                      requiredRoles={["admin", "officer", "leader"]}
                    >
                      <Transactions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute
                      requiredRoles={["admin", "officer", "leader"]}
                    >
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                {/* Officer/Admin routes (accessible to officers and admins) */}
                <Route
                  path="/loan-assessment"
                  element={
                    <ProtectedRoute requiredRoles={["officer"]}>
                      <LoanAssessment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute requiredRoles={["admin", "officer"]}>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />

                {/* Admin-only routes */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredRoles={["admin"]}>
                      <Users />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all route for any undefined paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
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
