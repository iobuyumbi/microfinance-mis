import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminLoanAssessmentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loan Assessments</h1>
        <p className="text-muted-foreground">Manage loan assessments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
          <CardDescription>View and manage loan assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Loan assessment features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoanAssessmentsPage; 