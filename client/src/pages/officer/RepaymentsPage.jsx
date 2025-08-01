import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OfficerRepaymentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Repayment Processing</h1>
        <p className="text-muted-foreground">Process loan repayments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repayments</CardTitle>
          <CardDescription>Process and track repayments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Repayment processing features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerRepaymentsPage; 