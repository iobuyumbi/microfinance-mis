import React from "react";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "./AdminLayout";
import LeaderLayout from "./LeaderLayout";
import MemberLayout from "./MemberLayout";

// Dynamic layout component that renders the appropriate layout based on user role
export default function DynamicLayout() {
  const { user, loading } = useAuth();

  // Show loading while determining user role
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render appropriate layout based on user role
  switch (user.role) {
    case "admin":
      return <AdminLayout />;
    case "officer":
      return <AdminLayout />; // Officers use admin layout with restricted access
    case "leader":
      return <LeaderLayout />;
    case "member":
    default:
      return <MemberLayout />;
  }
}
