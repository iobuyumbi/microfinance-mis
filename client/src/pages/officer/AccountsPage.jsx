import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OfficerAccountsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Supervision</h1>
        <p className="text-muted-foreground">Supervise member accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Accounts</CardTitle>
          <CardDescription>View and supervise accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Account supervision features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerAccountsPage; 