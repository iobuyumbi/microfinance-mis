import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PiggyBank, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils";

const AdminSavingsPage = () => {
  const [savings] = useState([
    {
      id: "1",
      accountNumber: "SAV-2024-001",
      member: "John Doe",
      balance: 25000,
      status: "active",
      lastDeposit: "2024-01-15",
      totalDeposits: 30000,
      totalWithdrawals: 5000
    },
    {
      id: "2",
      accountNumber: "SAV-2024-002",
      member: "Jane Smith",
      balance: 15000,
      status: "active",
      lastDeposit: "2024-01-18",
      totalDeposits: 20000,
      totalWithdrawals: 5000
    }
  ]);

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Savings Management</h1>
          <p className="text-muted-foreground">Manage member savings accounts</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Savings Accounts</CardTitle>
          <CardDescription>View and manage member savings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Deposit</TableHead>
                <TableHead>Total Deposits</TableHead>
                <TableHead>Total Withdrawals</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savings.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.accountNumber}</TableCell>
                  <TableCell>{account.member}</TableCell>
                  <TableCell>{formatCurrency(account.balance)}</TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell>{formatDate(account.lastDeposit)}</TableCell>
                  <TableCell>{formatCurrency(account.totalDeposits)}</TableCell>
                  <TableCell>{formatCurrency(account.totalWithdrawals)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

export default AdminSavingsPage; 