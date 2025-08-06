// client/src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "@/context/AuthContext";

// Lazy load layouts
const LandingLayout = lazy(() => import("@/layouts/LandingLayout"));
const AuthLayout = lazy(() => import("@/layouts/AuthLayout"));
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const OfficerLayout = lazy(() => import("@/layouts/OfficerLayout"));
const UserLayout = lazy(() => import("@/layouts/UserLayout"));
const LoadingSpinner = lazy(() => import("@/components/common/LoadingSpinner"));

// Public Pages
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));

// Auth Pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));

// Dynamic Pages
const DynamicDashboardPage = lazy(() => import("@/pages/DynamicDashboardPage"));
const DynamicLoansPage = lazy(() => import("@/pages/DynamicLoansPage"));
const DynamicLoanAssessmentPage = lazy(
  () => import("@/pages/DynamicLoanAssessmentPage")
); // New dynamic page

// Other main application pages
const SavingsPage = lazy(() => import("@/pages/SavingsPage"));
const MembersPage = lazy(() => import("@/pages/MembersPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/UsersPage")); // Example of a specific admin page
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// ErrorBoundary Fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center h-screen bg-gray-100 text-red-600"
    >
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-lg mb-4">{error.message}</p>
      <Button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Try again
      </Button>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />; // Redirect to a dashboard or a forbidden page
  }

  return children;
};

// AppLayout component
const AppLayout = () => {
  const { user } = useAuth();
  const role = user?.role;

  switch (role) {
    case "admin":
      return <AdminLayout />;
    case "officer":
      return <OfficerLayout />;
    case "leader":
    case "member":
    default:
      return <UserLayout />;
  }
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="reset-password/:token"
                element={<ResetPasswordPage />}
              />
            </Route>

            {/* Protected routes that use AppLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dynamic Pages */}
              <Route path="dashboard" element={<DynamicDashboardPage />} />
              <Route path="loans" element={<DynamicLoansPage />} />
              <Route
                path="loan-assessments"
                element={<DynamicLoanAssessmentPage />}
              />{" "}
              {/* New route */}
              {/* Other common authenticated pages */}
              <Route path="savings" element={<SavingsPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              {/* Admin-specific pages with role-based protection */}
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              {/* Add other role-specific routes as needed */}
              {/* Redirect authenticated users from root to their dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* 404 Page - Catch all other routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Suspense>

      {/* Sonner Toaster component for displaying notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "white", color: "black" },
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
    </ErrorBoundary>
  );
}

export default App;
