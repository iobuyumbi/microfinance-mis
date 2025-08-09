import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CreditCard, Plus } from "lucide-react";

const TransactionsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage financial transactions and records
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Transactions
          </CardTitle>
          <CardDescription>
            View and manage all financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Transaction Management</h3>
            <p className="text-muted-foreground mb-4">
              This page will display all financial transactions with their details, amounts, and status.
            </p>
            <p className="text-sm text-muted-foreground">
              Features: Transaction creation, payment processing, record keeping, and financial reporting.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
