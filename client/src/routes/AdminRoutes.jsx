import React from "react";
import { Routes, Route } from "react-router-dom";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="users" element={<div>Admin Users Page</div>} />
      <Route path="reports" element={<div>Admin Reports Page</div>} />
      <Route path="settings" element={<div>Admin Settings Page</div>} />
    </Routes>
  );
};

export default AdminRoutes;
