import React from "react";
import { Routes, Route } from "react-router-dom";

const OfficerRoutes = () => {
  return (
    <Routes>
      <Route path="members" element={<div>Officer Members Page</div>} />
      <Route path="loans" element={<div>Officer Loans Page</div>} />
      <Route path="reports" element={<div>Officer Reports Page</div>} />
    </Routes>
  );
};

export default OfficerRoutes;
