import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load loan-related pages
const DynamicLoansPage = lazy(() => import("@/pages/DynamicLoansPage"));
const DynamicLoanAssessmentPage = lazy(() => import("@/pages/DynamicLoanAssessmentPage"));

const LoanRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Route index element={<DynamicLoansPage />} />
      <Route path="assessments" element={<DynamicLoanAssessmentPage />} />
      {/* Add more loan-related routes here as needed */}
      {/* <Route path=":id" element={<LoanDetailsPage />} /> */}
      {/* <Route path=":id/repayments" element={<LoanRepaymentsPage />} /> */}
    </Suspense>
  );
};

export default LoanRoutes; 