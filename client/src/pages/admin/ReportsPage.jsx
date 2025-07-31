import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users } from "lucide-react";
import { formatCurrency } from "@/utils";

const AdminReportsPage = () => {
  const [reportType, setReportType] = useState("financial");
  const [timeRange, setTimeRange] = useState("month");

  // Mock data for charts
  const loanData = [
    { month: "Jan", disbursed: 500000, collected: 450000 },
    { month: "Feb", disbursed: 600000, collected: 520000 },
    { month: "Mar", disbursed: 450000, collected: 480000 },
    { month: "Apr", disbursed: 700000, collected: 650000 },
    { month: "May", disbursed: 550000, collected: 580000 },
    { month: "Jun", disbursed: 800000, collected: 720000 }
  ];

  const savingsData = [
    { month: "Jan", deposits: 300000, withdrawals: 150000 },
    { month: "Feb", deposits: 350000, withdrawals: 180000 },
    { month: "Mar", deposits: 400000, withdrawals: 200000 },
    { month: "Apr", deposits: 450000, withdrawals: 220000 },
    { month: "May", deposits: 500000, withdrawals: 250000 },
    { month: "Jun", deposits: 550000, withdrawals: 280000 }
  ];

  const memberStats = [
    { name: "Active Members", value: 150, color: "#10b981" },
    { name: "New Members", value: 25, color: "#3b82f6" },
    { name: "Inactive Members", value: 10, color: "#ef4444" }
  ];

  const summaryStats = {
    totalLoans: 1250000,
    activeLoans: 850000,
    totalSavings: 2100000,
    totalMembers: 185,
    monthlyGrowth: 12.5,
    repaymentRate: 94.2
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Financial reports and performance analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalLoans)}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.activeLoans ? `${formatCurrency(summaryStats.activeLoans)} active` : "No active loans"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalSavings)}</div>
            <p className="text-xs text-muted-foreground">
              +{summaryStats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active microfinance members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repayment Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.repaymentRate}%</div>
            <p className="text-xs text-muted-foreground">
              On-time loan repayments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Performance</CardTitle>
            <CardDescription>Monthly loan disbursements vs collections</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loanData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="disbursed" fill="#3b82f6" name="Disbursed" />
                <Bar dataKey="collected" fill="#10b981" name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Activity</CardTitle>
            <CardDescription>Monthly deposits vs withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="deposits" stroke="#10b981" name="Deposits" />
                <Line type="monotone" dataKey="withdrawals" stroke="#ef4444" name="Withdrawals" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Member Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Member Distribution</CardTitle>
          <CardDescription>Current member status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={memberStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {memberStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportsPage; 