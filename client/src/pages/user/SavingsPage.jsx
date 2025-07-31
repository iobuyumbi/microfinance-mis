import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PiggyBank, Plus, TrendingUp, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils";

const UserSavingsPage = () => {
  const [savingsAccount] = useState({
    accountNumber: "SAV-2024-001",
    balance: 25000,
    totalDeposits: 30000,
    totalWithdrawals: 5000,
    interestEarned: 1200,
    lastTransaction: "2024-01-15"
  });

  const [transactions] = useState([
    {
      id: "1",
      type: "deposit",
      amount: 5000,
      date: "2024-01-15",
      description: "Monthly deposit",
      balance: 25000
    },
    {
      id: "2",
      type: "withdrawal",
      amount: 2000,
      date: "2024-01-10",
      description: "Emergency withdrawal",
      balance: 20000
    },
    {
      id: "3",
      type: "deposit",
      amount: 3000,
      date: "2024-01-05",
      description: "Monthly deposit",
      balance: 22000
    }
  ]);

  const getTransactionBadge = (type) => {
    const colors = {
      deposit: "bg-green-100 text-green-800",
      withdrawal: "bg-red-100 text-red-800",
      interest: "bg-blue-100 text-blue-800"
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Savings</h1>
          <p className="text-muted-foreground">Manage your savings account</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Statement
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Deposit
          </Button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(savingsAccount.balance)}</div>
            <p className="text-xs text-muted-foreground">
              Account: {savingsAccount.accountNumber}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(savingsAccount.totalDeposits)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime deposits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(savingsAccount.totalWithdrawals)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(savingsAccount.interestEarned)}</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent savings transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{getTransactionBadge(transaction.type)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{formatCurrency(transaction.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSavingsPage; 