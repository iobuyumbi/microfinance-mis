import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminGuarantorsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Guarantor Management</h1>
        <p className="text-muted-foreground">Manage loan guarantors</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Guarantors</CardTitle>
          <CardDescription>View and manage guarantors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Guarantor management features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGuarantorsPage; 