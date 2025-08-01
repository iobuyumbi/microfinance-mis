import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, TrendingUp, DollarSign } from "lucide-react";

const UserAccountsPage = () => {
  const accounts = [
    {
      id: 1,
      accountNumber: "ACC001",
      accountType: "Savings",
      balance: 25000,
      status: "Active",
      lastTransaction: "2024-01-15",
    },
    {
      id: 2,
      accountNumber: "ACC002", 
      accountType: "Loan",
      balance: -15000,
      status: "Active",
      lastTransaction: "2024-01-10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Accounts</h1>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Statement
        </Button>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦10,000</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Savings & Loan accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦5,000</div>
            <p className="text-xs text-muted-foreground">
              +5,000 in deposits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Transaction</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.accountNumber}
                  </TableCell>
                  <TableCell>{account.accountType}</TableCell>
                  <TableCell className={account.balance < 0 ? "text-red-600" : "text-green-600"}>
                    ₦{Math.abs(account.balance).toLocaleString()}
                    {account.balance < 0 && " (Debt)"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.status === "Active" ? "default" : "secondary"}>
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.lastTransaction}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccountsPage; 