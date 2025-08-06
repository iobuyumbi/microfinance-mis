// client/src/pages/DynamicLoansPage.jsx
import React, { lazy, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load the role-specific loans pages
const AdminLoansPage = lazy(() => import("@/pages/admin/LoansPage"));
const OfficerLoanApplicationsPage = lazy(
  () => import("@/pages/officer/LoanApplicationsPage")
);
const UserLoansPage = lazy(() => import("@/pages/user/LoansPage"));

/**
 * DynamicLoansPage component renders the appropriate loans page based on the user's role.
 * It uses React.lazy and Suspense for code splitting, ensuring only the necessary loans
 * component is loaded.
 */
const DynamicLoansPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while authentication state is being determined
    return <LoadingSpinner />;
  }

  // Determine which loans component to render based on the user's role
  let LoansComponent;
  switch (user?.role) {
    case "admin":
      LoansComponent = AdminLoansPage;
      break;
    case "officer":
      LoansComponent = OfficerLoanApplicationsPage; // Officer gets the LoanApplicationsPage
      break;
    case "member":
    case "leader": // Assuming leader also uses the user loans page
    default: // Default to user loans page if role is not recognized or missing
      LoansComponent = UserLoansPage;
      break;
  }

  return (
    // Suspense is necessary for lazy-loaded components. It displays the fallback
    // (e.g., a loading spinner) while the component's code is being fetched.
    <Suspense fallback={<LoadingSpinner />}>
      <LoansComponent />
    </Suspense>
  );
};

export default DynamicLoansPage;
