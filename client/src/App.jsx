import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "next-themes"; // Keep this import as it was in the original code, not context theme
import { SocketProvider } from "./context/SocketContext";

// Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/common/ErrorBoundary"; // Added ErrorBoundary import

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

// Main Pages
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import LoansPage from "./pages/LoansPage";
import SavingsPage from "./pages/SavingsPage";
import TransactionsPage from "./pages/TransactionsPage";
import MeetingsPage from "./pages/MeetingsPage";
import MembersPage from "./pages/MembersPage";
import ChatPage from "./pages/ChatPage";
import ContributionsPage from "./pages/ContributionsPage";

// Styles
import "./index.css";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="microfinance-theme">
      <AuthProvider>
        <SocketProvider>
          <Router>
            <ErrorBoundary> {/* Wrap routes in ErrorBoundary */}
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route
                      path="forgot-password"
                      element={<ForgotPasswordPage />}
                    />
                  </Route>

                  {/* Protected Dashboard Routes */}
                  <Route path="/" element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                      {/* Dashboard */}
                      <Route index element={<DashboardPage />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="profile" element={<ProfilePage />} />

                      {/* Main Routes */}
                      <Route path="users" element={<UsersPage />} />
                      <Route path="groups" element={<GroupsPage />} />
                      <Route path="groups/:id" element={<GroupDetailPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="loans" element={<LoansPage />} />
                      <Route path="savings" element={<SavingsPage />} />
                      <Route path="transactions" element={<TransactionsPage />} />
                      <Route path="meetings" element={<MeetingsPage />} />
                      <Route path="members" element={<MembersPage />} />
                      <Route path="chat" element={<ChatPage />} />
                      <Route
                        path="contributions"
                        element={<ContributionsPage />}
                      />
                    </Route>
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </ErrorBoundary> {/* Close ErrorBoundary wrapper */}
          </Router>
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;