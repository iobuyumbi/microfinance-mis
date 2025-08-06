// client/src/pages/DynamicSavingsPage.jsx
import React, { lazy, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load the role-specific savings pages
const AdminSavingsPage = lazy(() => import("@/pages/admin/SavingsPage"));
const OfficerSavingsPage = lazy(() => import("@/pages/officer/SavingsPage")); // We'll create this placeholder
const UserSavingsPage = lazy(() => import("@/pages/user/SavingsPage"));

/**
 * DynamicSavingsPage component renders the appropriate savings page based on the user's role.
 * It uses React.lazy and Suspense for code splitting, ensuring only the necessary
 * component is loaded.
 */
const DynamicSavingsPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while authentication state is being determined
    return <LoadingSpinner />;
  }

  // Determine which savings component to render based on the user's role
  let SavingsComponent;
  switch (user?.role) {
    case "admin":
      SavingsComponent = AdminSavingsPage;
      break;
    case "officer":
      SavingsComponent = OfficerSavingsPage;
      break;
    case "member":
    case "leader": // Assuming leader also uses the user savings page
    default: // Default to user savings page if role is not recognized or missing
      SavingsComponent = UserSavingsPage;
      break;
  }

  return (
    // Suspense is necessary for lazy-loaded components. It displays the fallback
    // (e.g., a loading spinner) while the component's code is being fetched.
    <Suspense fallback={<LoadingSpinner />}>
      <SavingsComponent />
    </Suspense>
  );
};

export default DynamicSavingsPage;
