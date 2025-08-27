import React, { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

// Utils
import { FinancialConstants } from "./utils/financialUtils";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/RegisterPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
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

// Common Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { settingsService } from "./services/settingsService";

// Styles
import "./index.css";

const SettingsContext = createContext({
  currency: FinancialConstants.DEFAULT_CURRENCY,
});
export const useSettings = () => useContext(SettingsContext);

function App() {
  const [settings, setSettings] = useState({
    currency: FinancialConstants.DEFAULT_CURRENCY,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsService.get();
        const data = res?.data?.data || res?.data || res || {};
        const currency =
          data?.general?.currency ||
          data?.currency ||
          FinancialConstants.DEFAULT_CURRENCY;
        setSettings({ currency });
        try {
          localStorage.setItem("appCurrency", currency);
        } catch (_) {}
      } catch (e) {
        // Fallback to default currency on error; avoid blocking app
        setSettings({ currency: FinancialConstants.DEFAULT_CURRENCY });
        try {
          localStorage.setItem(
            "appCurrency",
            FinancialConstants.DEFAULT_CURRENCY
          );
        } catch (_) {}
      }
    };
    loadSettings();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="microfinance-theme">
      <AuthProvider>
        <SocketProvider>
          <Router>
            <SettingsContext.Provider value={settings}>
              <ErrorBoundary>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Routes>
                    {/* Auth Routes */}
                    <Route path="/auth" element={<AuthLayout />}>
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
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
                        <Route
                          path="groups/:id"
                          element={<GroupDetailPage />}
                        />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="loans" element={<LoansPage />} />
                        <Route path="savings" element={<SavingsPage />} />
                        <Route
                          path="transactions"
                          element={<TransactionsPage />}
                        />
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
              </ErrorBoundary>
            </SettingsContext.Provider>
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
