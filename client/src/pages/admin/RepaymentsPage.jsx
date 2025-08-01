import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminRepaymentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Repayment Management</h1>
        <p className="text-muted-foreground">Manage loan repayments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Repayments</CardTitle>
          <CardDescription>View and manage repayments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Repayment management features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRepaymentsPage; 