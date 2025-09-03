import React from "react";
import { PiggyBank, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const GroupFinances = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Group Finances
        </CardTitle>
        <CardDescription>Financial overview of this group</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Financial Management</h3>
          <p className="text-muted-foreground mb-4">
            Track group savings, loans, and transactions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline">
              <PiggyBank className="mr-2 h-4 w-4" />
              Manage Savings
            </Button>
            <Button variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Manage Loans
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupFinances;