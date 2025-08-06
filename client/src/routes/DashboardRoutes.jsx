import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load dashboard-related pages
const DynamicDashboardPage = lazy(() => import("@/pages/DynamicDashboardPage"));
const DynamicSavingsPage = lazy(() => import("@/pages/DynamicSavingsPage"));

const DashboardRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Route index element={<DynamicDashboardPage />} />
      <Route path="savings" element={<DynamicSavingsPage />} />
      {/* Add more dashboard-related routes here as needed */}
      {/* <Route path="reports" element={<ReportsPage />} /> */}
      {/* <Route path="transactions" element={<TransactionsPage />} /> */}
    </Suspense>
  );
};

export default DashboardRoutes; 