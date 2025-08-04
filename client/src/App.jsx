// client/src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "@/context/AuthContext"; // Our new Auth Context hook

// Use React.lazy for code splitting to improve initial load time.
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

// Main Application Pages
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const LoansPage = lazy(() => import("@/pages/LoansPage"));
const SavingsPage = lazy(() => import("@/pages/SavingsPage"));
const MembersPage = lazy(() => import("@/pages/MembersPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/UsersPage"));
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
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Try again
      </button>
    </div>
  );
};

// This component uses our new useAuth hook to protect routes.
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // Show a loading spinner while the auth state is being checked
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if the user's role is in the list of allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to a dashboard or a forbidden page if the role is not allowed
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// This is the new, single layout component that dynamically renders the correct layout
// based on the user's role.
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
    // Wrap the entire app in an ErrorBoundary to catch any rendering errors
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* Suspense is required for lazy-loaded components. 
        It shows a fallback component (like a loading spinner) while the lazy component is loading.
      */}
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

            {/* This is the magic! A single ProtectedRoute for all authenticated pages.
              The AppLayout component then handles rendering the correct layout based on the user's role.
            */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Common pages for all authenticated users, rendered within AppLayout */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="loans" element={<LoansPage />} />
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
              {/* We've simplified the routing for admin pages. You can add more here. */}

              {/* Redirect authenticated users from root to their dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* 404 Page - Catch all other routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Suspense>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          // Your existing toaster options
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
