import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Role-based access control component
export function RoleBasedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/dashboard",
  fallbackComponent = null,
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole =
    allowedRoles.length === 0 || (user && allowedRoles.includes(user.role));

  // If user doesn't have required role, show fallback or redirect
  if (!hasRequiredRole) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

// Specific role-based route components
export function AdminRoute({ children }) {
  return (
    <RoleBasedRoute
      allowedRoles={["admin"]}
      redirectTo="/dashboard"
      fallbackComponent={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground">
              This page is only accessible to administrators.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </RoleBasedRoute>
  );
}

export function StaffRoute({ children }) {
  return (
    <RoleBasedRoute allowedRoles={["admin", "officer"]} redirectTo="/dashboard">
      {children}
    </RoleBasedRoute>
  );
}

export function LeaderRoute({ children }) {
  return (
    <RoleBasedRoute
      allowedRoles={["admin", "officer", "leader"]}
      redirectTo="/dashboard"
    >
      {children}
    </RoleBasedRoute>
  );
}

export function MemberRoute({ children }) {
  return (
    <RoleBasedRoute
      allowedRoles={["admin", "officer", "leader", "member"]}
      redirectTo="/dashboard"
    >
      {children}
    </RoleBasedRoute>
  );
}
