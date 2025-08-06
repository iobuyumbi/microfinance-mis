// client/src/pages/DynamicDashboardPage.jsx
import React, { lazy, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner"; // Assuming you have a LoadingSpinner

// Lazy load the role-specific dashboard pages
const AdminDashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const OfficerDashboardPage = lazy(
  () => import("@/pages/officer/DashboardPage")
);
const UserDashboardPage = lazy(() => import("@/pages/user/DashboardPage"));

/**
 * DynamicDashboardPage component renders the appropriate dashboard based on the user's role.
 * It uses React.lazy and Suspense for code splitting, ensuring only the necessary dashboard
 * component is loaded.
 */
const DynamicDashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while authentication state is being determined
    return <LoadingSpinner />;
  }

  // Determine which dashboard component to render based on the user's role
  let DashboardComponent;
  switch (user?.role) {
    case "admin":
      DashboardComponent = AdminDashboardPage;
      break;
    case "officer":
      DashboardComponent = OfficerDashboardPage;
      break;
    case "leader": // Assuming leader also uses the user dashboard
    case "member":
    default: // Default to user dashboard if role is not recognized or missing
      DashboardComponent = UserDashboardPage;
      break;
  }

  return (
    // Suspense is necessary for lazy-loaded components. It displays the fallback
    // (e.g., a loading spinner) while the component's code is being fetched.
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardComponent />
    </Suspense>
  );
};

export default DynamicDashboardPage;
