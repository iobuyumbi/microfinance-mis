import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calendar, TrendingUp, AlertCircle } from "lucide-react";

const UserRepaymentsPage = () => {
  const repayments = [
    {
      id: 1,
      loanNumber: "LOAN001",
      dueDate: "2024-01-20",
      amount: 15000,
      status: "Paid",
      paidDate: "2024-01-18",
      remainingBalance: 85000,
    },
    {
      id: 2,
      loanNumber: "LOAN001",
      dueDate: "2024-02-20",
      amount: 15000,
      status: "Pending",
      paidDate: null,
      remainingBalance: 70000,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Loan Repayments</h1>
        <Button>
          <DollarSign className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦70,000</div>
            <p className="text-xs text-muted-foreground">
              From 1 active loan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦15,000</div>
            <p className="text-xs text-muted-foreground">
              Due on Feb 20th
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦15,000</div>
            <p className="text-xs text-muted-foreground">
              Paid on Jan 18th
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0</div>
            <p className="text-xs text-muted-foreground">
              No overdue payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Repayments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Repayment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan Number</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Remaining Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repayments.map((repayment) => (
                <TableRow key={repayment.id}>
                  <TableCell className="font-medium">
                    {repayment.loanNumber}
                  </TableCell>
                  <TableCell>{repayment.dueDate}</TableCell>
                  <TableCell className="font-medium">
                    ₦{repayment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={repayment.status === "Paid" ? "default" : "secondary"}>
                      {repayment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{repayment.paidDate || "-"}</TableCell>
                  <TableCell>₦{repayment.remainingBalance.toLocaleString()}</TableCell>
                  <TableCell>
                    {repayment.status === "Pending" && (
                      <Button variant="outline" size="sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    )}
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

export default UserRepaymentsPage; 