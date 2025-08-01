import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Download, TrendingUp, DollarSign } from "lucide-react";

const UserContributionsPage = () => {
  const contributions = [
    {
      id: 1,
      date: "2024-01-15",
      amount: 5000,
      type: "Regular",
      status: "Paid",
      description: "Monthly contribution",
    },
    {
      id: 2,
      date: "2024-01-10",
      amount: 2000,
      type: "Emergency",
      status: "Paid",
      description: "Emergency fund contribution",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Contributions</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Contribution
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦25,000</div>
            <p className="text-xs text-muted-foreground">
              +₦7,000 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦7,000</div>
            <p className="text-xs text-muted-foreground">
              2 contributions made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Due</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦5,000</div>
            <p className="text-xs text-muted-foreground">
              Due on Feb 1st
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.map((contribution) => (
                <TableRow key={contribution.id}>
                  <TableCell>{contribution.date}</TableCell>
                  <TableCell className="font-medium">
                    ₦{contribution.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={contribution.type === "Regular" ? "default" : "secondary"}>
                      {contribution.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={contribution.status === "Paid" ? "default" : "destructive"}>
                      {contribution.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{contribution.description}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
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

export default UserContributionsPage; 