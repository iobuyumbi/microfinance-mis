// client/src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Show a loading state while we check the user's authentication status
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the login page.
    return <Navigate to="/auth/login" replace />;
  }

  // If roles are specified, check if the user's role is included.
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If the user's role is not allowed, redirect them to a default dashboard.
    // In a real application, you might want a dedicated "403 Forbidden" page here.
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and authorized, render the child components.
  return children;
};

export default ProtectedRoute;
