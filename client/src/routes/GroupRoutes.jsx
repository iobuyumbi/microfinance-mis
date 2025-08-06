import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load group-related pages
const DynamicGroupsPage = lazy(() => import("@/pages/DynamicGroupsPage"));

const GroupRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Route index element={<DynamicGroupsPage />} />
      {/* Add more group-related routes here as needed */}
      {/* <Route path=":id" element={<GroupDetailsPage />} /> */}
      {/* <Route path=":id/members" element={<GroupMembersPage />} /> */}
    </Suspense>
  );
};

export default GroupRoutes; 