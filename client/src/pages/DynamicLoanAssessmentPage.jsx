// client/src/pages/DynamicLoanAssessmentPage.jsx
import React, { lazy, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load the role-specific loan assessment pages
const AdminLoanAssessmentPage = lazy(
  () => import("@/pages/admin/LoanAssessmentPage")
);
const OfficerLoanAssessmentPage = lazy(
  () => import("@/pages/officer/LoanAssessmentPage")
);
const UserLoanAssessmentPage = lazy(
  () => import("@/pages/user/LoanAssessmentPage")
);

/**
 * DynamicLoanAssessmentPage component renders the appropriate loan assessment page based on the user's role.
 * It uses React.lazy and Suspense for code splitting, ensuring only the necessary component is loaded.
 */
const DynamicLoanAssessmentPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while authentication state is being determined
    return <LoadingSpinner />;
  }

  // Determine which loan assessment component to render based on the user's role
  let LoanAssessmentComponent;
  switch (user?.role) {
    case "admin":
      LoanAssessmentComponent = AdminLoanAssessmentPage;
      break;
    case "officer":
      LoanAssessmentComponent = OfficerLoanAssessmentPage;
      break;
    case "member":
    case "leader": // Assuming leader also uses the user loan assessment page
    default: // Default to user loan assessment page if role is not recognized or missing
      LoanAssessmentComponent = UserLoanAssessmentPage;
      break;
  }

  return (
    // Suspense is necessary for lazy-loaded components. It displays the fallback
    // (e.g., a loading spinner) while the component's code is being fetched.
    <Suspense fallback={<LoadingSpinner />}>
      <LoanAssessmentComponent />
    </Suspense>
  );
};

export default DynamicLoanAssessmentPage;
