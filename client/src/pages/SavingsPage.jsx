import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PiggyBank, Plus } from "lucide-react";

const SavingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings</h1>
          <p className="text-muted-foreground">
            Manage savings accounts and transactions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Savings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Savings Accounts
          </CardTitle>
          <CardDescription>
            View and manage all savings accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Savings Management</h3>
            <p className="text-muted-foreground mb-4">
              This page will display all savings accounts with their balances, transactions, and management options.
            </p>
            <p className="text-sm text-muted-foreground">
              Features: Savings accounts, deposits, withdrawals, balance tracking, and transaction history.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsPage;
