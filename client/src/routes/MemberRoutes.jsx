import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load member-related pages
const DynamicMembersPage = lazy(() => import("@/pages/DynamicMembersPage"));

const MemberRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Route index element={<DynamicMembersPage />} />
      {/* Add more member-related routes here as needed */}
      {/* <Route path=":id" element={<MemberDetailsPage />} /> */}
      {/* <Route path=":id/profile" element={<MemberProfilePage />} /> */}
    </Suspense>
  );
};

export default MemberRoutes; 