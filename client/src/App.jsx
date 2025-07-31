// client\src\App.jsx (REVISED)
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import { store, persistor } from "@/store";

// Layouts
import LandingLayout from "@/layouts/LandingLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import UserLayout from "@/layouts/UserLayout";

// Public Pages
import LandingPage from "@/pages/LandingPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Admin Pages
import AdminDashboardPage from "@/pages/admin/DashboardPage";
import AdminUsersPage from "@/pages/admin/UsersPage";
import AdminLoansPage from "@/pages/admin/LoansPage";
import AdminSavingsPage from "@/pages/admin/SavingsPage";
import AdminReportsPage from "@/pages/admin/ReportsPage";
import AdminMeetingsPage from "@/pages/admin/MeetingsPage";
import AdminSettingsPage from "@/pages/admin/SettingsPage";
import AdminProfilePage from "@/pages/admin/ProfilePage";

// User Pages
import UserDashboardPage from "@/pages/user/DashboardPage";
import UserLoansPage from "@/pages/user/LoansPage";
import UserSavingsPage from "@/pages/user/SavingsPage";
import UserGroupPage from "@/pages/user/GroupPage";
import UserMeetingsPage from "@/pages/user/MeetingsPage";
import UserReportsPage from "@/pages/user/ReportsPage";
import UserSettingsPage from "@/pages/user/SettingsPage";
import UserProfilePage from "@/pages/user/ProfilePage";

// Error Pages
import NotFoundPage from "@/pages/NotFoundPage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = store.getState().auth;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Role-based Route Component
const RoleBasedRoute = ({ adminComponent, userComponent }) => {
  const { user } = store.getState().auth;

  if (user?.role === "admin") {
    return adminComponent;
  }

  return userComponent;
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingLayout />}>
                <Route index element={<LandingPage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="loans" element={<AdminLoansPage />} />
                <Route path="savings" element={<AdminSavingsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="meetings" element={<AdminMeetingsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
              </Route>

              {/* User Routes */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute allowedRoles={["member", "leader"]}>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to="/user/dashboard" replace />}
                />
                <Route path="dashboard" element={<UserDashboardPage />} />
                <Route path="loans" element={<UserLoansPage />} />
                <Route path="savings" element={<UserSavingsPage />} />
                <Route path="group" element={<UserGroupPage />} />
                <Route path="meetings" element={<UserMeetingsPage />} />
                <Route path="reports" element={<UserReportsPage />} />
                <Route path="settings" element={<UserSettingsPage />} />
                <Route path="profile" element={<UserProfilePage />} />
              </Route>

              {/* Legacy Routes - Redirect to appropriate layout */}
              <Route
                path="/dashboard"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/dashboard" replace />}
                    userComponent={<Navigate to="/user/dashboard" replace />}
                  />
                }
              />
              <Route
                path="/loans"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/loans" replace />}
                    userComponent={<Navigate to="/user/loans" replace />}
                  />
                }
              />
              <Route
                path="/savings"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/savings" replace />}
                    userComponent={<Navigate to="/user/savings" replace />}
                  />
                }
              />
              <Route
                path="/reports"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/reports" replace />}
                    userComponent={<Navigate to="/user/reports" replace />}
                  />
                }
              />
              <Route
                path="/meetings"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/meetings" replace />}
                    userComponent={<Navigate to="/user/meetings" replace />}
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/settings" replace />}
                    userComponent={<Navigate to="/user/settings" replace />}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/profile" replace />}
                    userComponent={<Navigate to="/user/profile" replace />}
                  />
                }
              />

              {/* Auth Redirects */}
              <Route
                path="/login"
                element={<Navigate to="/auth/login" replace />}
              />
              <Route
                path="/register"
                element={<Navigate to="/auth/register" replace />}
              />

              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "white",
                  color: "black",
                },
                success: {
                  style: {
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                  },
                },
                error: {
                  style: {
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                  },
                },
              }}
            />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
