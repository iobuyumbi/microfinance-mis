import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OfficerTransactionsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Processing</h1>
        <p className="text-muted-foreground">Process financial transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Process and track transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Transaction processing features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerTransactionsPage; 