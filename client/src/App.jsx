// client\src\App.jsx (COMPREHENSIVE)
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
import OfficerLayout from "@/layouts/OfficerLayout";
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
import AdminAccountsPage from "@/pages/admin/AccountsPage";
import AdminContributionsPage from "@/pages/admin/ContributionsPage";
import AdminRepaymentsPage from "@/pages/admin/RepaymentsPage";
import AdminGuarantorsPage from "@/pages/admin/GuarantorsPage";
import AdminLoanAssessmentsPage from "@/pages/admin/LoanAssessmentsPage";
import AdminChatPage from "@/pages/admin/ChatPage";
import AdminTransactionsPage from "@/pages/admin/TransactionsPage";
import AdminGroupsPage from "@/pages/admin/GroupsPage";
import AdminNotificationsPage from "@/pages/admin/NotificationsPage";

// Officer Pages
import OfficerDashboardPage from "@/pages/officer/DashboardPage";
import OfficerLoanApplicationsPage from "@/pages/officer/LoanApplicationsPage";
import OfficerLoanAssessmentsPage from "@/pages/officer/LoanAssessmentsPage";
import OfficerGuarantorsPage from "@/pages/officer/GuarantorsPage";
import OfficerRepaymentsPage from "@/pages/officer/RepaymentsPage";
import OfficerAccountsPage from "@/pages/officer/AccountsPage";
import OfficerContributionsPage from "@/pages/officer/ContributionsPage";
import OfficerChatPage from "@/pages/officer/ChatPage";
import OfficerReportsPage from "@/pages/officer/ReportsPage";
import OfficerMeetingsPage from "@/pages/officer/MeetingsPage";
import OfficerSettingsPage from "@/pages/officer/SettingsPage";
import OfficerProfilePage from "@/pages/officer/ProfilePage";
import OfficerTransactionsPage from "@/pages/officer/TransactionsPage";
import OfficerGroupsPage from "@/pages/officer/GroupsPage";
import OfficerNotificationsPage from "@/pages/officer/NotificationsPage";

// User Pages
import UserDashboardPage from "@/pages/user/DashboardPage";
import UserLoansPage from "@/pages/user/LoansPage";
import UserSavingsPage from "@/pages/user/SavingsPage";
import UserGroupPage from "@/pages/user/GroupPage";
import UserMeetingsPage from "@/pages/user/MeetingsPage";
import UserReportsPage from "@/pages/user/ReportsPage";
import UserSettingsPage from "@/pages/user/SettingsPage";
import UserProfilePage from "@/pages/user/ProfilePage";
import UserAccountsPage from "@/pages/user/AccountsPage";
import UserContributionsPage from "@/pages/user/ContributionsPage";
import UserRepaymentsPage from "@/pages/user/RepaymentsPage";
import UserTransactionsPage from "@/pages/user/TransactionsPage";
import UserChatPage from "@/pages/user/ChatPage";
import UserNotificationsPage from "@/pages/user/NotificationsPage";

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
const RoleBasedRoute = ({
  adminComponent,
  officerComponent,
  userComponent,
}) => {
  const { user } = store.getState().auth;

  if (user?.role === "admin") {
    return adminComponent;
  }

  if (user?.role === "officer") {
    return officerComponent;
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
                <Route path="accounts" element={<AdminAccountsPage />} />
                <Route
                  path="contributions"
                  element={<AdminContributionsPage />}
                />
                <Route path="repayments" element={<AdminRepaymentsPage />} />
                <Route path="guarantors" element={<AdminGuarantorsPage />} />
                <Route
                  path="loan-assessments"
                  element={<AdminLoanAssessmentsPage />}
                />
                <Route path="chat" element={<AdminChatPage />} />
                <Route
                  path="transactions"
                  element={<AdminTransactionsPage />}
                />
                <Route path="groups" element={<AdminGroupsPage />} />
                <Route
                  path="notifications"
                  element={<AdminNotificationsPage />}
                />
              </Route>

              {/* Officer Routes */}
              <Route
                path="/officer"
                element={
                  <ProtectedRoute allowedRoles={["officer"]}>
                    <OfficerLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to="/officer/dashboard" replace />}
                />
                <Route path="dashboard" element={<OfficerDashboardPage />} />
                <Route
                  path="loan-applications"
                  element={<OfficerLoanApplicationsPage />}
                />
                <Route
                  path="loan-assessments"
                  element={<OfficerLoanAssessmentsPage />}
                />
                <Route path="guarantors" element={<OfficerGuarantorsPage />} />
                <Route path="repayments" element={<OfficerRepaymentsPage />} />
                <Route path="accounts" element={<OfficerAccountsPage />} />
                <Route
                  path="contributions"
                  element={<OfficerContributionsPage />}
                />
                <Route path="chat" element={<OfficerChatPage />} />
                <Route path="reports" element={<OfficerReportsPage />} />
                <Route path="meetings" element={<OfficerMeetingsPage />} />
                <Route path="settings" element={<OfficerSettingsPage />} />
                <Route path="profile" element={<OfficerProfilePage />} />
                <Route
                  path="transactions"
                  element={<OfficerTransactionsPage />}
                />
                <Route path="groups" element={<OfficerGroupsPage />} />
                <Route
                  path="notifications"
                  element={<OfficerNotificationsPage />}
                />
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
                <Route path="accounts" element={<UserAccountsPage />} />
                <Route
                  path="contributions"
                  element={<UserContributionsPage />}
                />
                <Route path="repayments" element={<UserRepaymentsPage />} />
                <Route path="transactions" element={<UserTransactionsPage />} />
                <Route path="chat" element={<UserChatPage />} />
                <Route
                  path="notifications"
                  element={<UserNotificationsPage />}
                />
              </Route>

              {/* Legacy Routes - Redirect to appropriate layout */}
              <Route
                path="/dashboard"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/dashboard" replace />}
                    officerComponent={
                      <Navigate to="/officer/dashboard" replace />
                    }
                    userComponent={<Navigate to="/user/dashboard" replace />}
                  />
                }
              />
              <Route
                path="/loans"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/loans" replace />}
                    officerComponent={
                      <Navigate to="/officer/loan-applications" replace />
                    }
                    userComponent={<Navigate to="/user/loans" replace />}
                  />
                }
              />
              <Route
                path="/savings"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/savings" replace />}
                    officerComponent={
                      <Navigate to="/officer/accounts" replace />
                    }
                    userComponent={<Navigate to="/user/savings" replace />}
                  />
                }
              />
              <Route
                path="/reports"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/reports" replace />}
                    officerComponent={
                      <Navigate to="/officer/reports" replace />
                    }
                    userComponent={<Navigate to="/user/reports" replace />}
                  />
                }
              />
              <Route
                path="/meetings"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/meetings" replace />}
                    officerComponent={
                      <Navigate to="/officer/meetings" replace />
                    }
                    userComponent={<Navigate to="/user/meetings" replace />}
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/settings" replace />}
                    officerComponent={
                      <Navigate to="/officer/settings" replace />
                    }
                    userComponent={<Navigate to="/user/settings" replace />}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <RoleBasedRoute
                    adminComponent={<Navigate to="/admin/profile" replace />}
                    officerComponent={
                      <Navigate to="/officer/profile" replace />
                    }
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
