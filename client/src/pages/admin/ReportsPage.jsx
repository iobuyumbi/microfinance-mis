import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/utils";
import { reportService } from "@/services/reportService";
import { toast } from "sonner";

const AdminReportsPage = () => {
  const [reportType, setReportType] = useState("financial");
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loanData, setLoanData] = useState([]);
  const [savingsData, setSavingsData] = useState([]);
  const [memberStats, setMemberStats] = useState([]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getDashboardStats({ timeRange });
      setDashboardStats(res.data);
    } catch (err) {
      setError("Failed to load dashboard stats");
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  // Fetch loan data
  const fetchLoanData = async () => {
    try {
      const res = await reportService.getLoanReports({ timeRange });
      setLoanData(res.data || []);
    } catch (err) {
      console.error("Failed to load loan data:", err);
    }
  };

  // Fetch savings data
  const fetchSavingsData = async () => {
    try {
      const res = await reportService.getSavingsReports({ timeRange });
      setSavingsData(res.data || []);
    } catch (err) {
      console.error("Failed to load savings data:", err);
    }
  };

  // Fetch member stats
  const fetchMemberStats = async () => {
    try {
      const res = await reportService.getMemberStats();
      setMemberStats(res.data || []);
    } catch (err) {
      console.error("Failed to load member stats:", err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchLoanData();
    fetchSavingsData();
    fetchMemberStats();
  }, [timeRange]);

  // Handle export
  const handleExport = async () => {
    try {
      const res = await reportService.exportReport(reportType, "pdf", {
        timeRange,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}-report-${timeRange}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardStats}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Financial reports and performance analytics
          </p>
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
          <Button variant="outline" onClick={handleExport}>
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
            <div className="text-2xl font-bold">
              {dashboardStats
                ? formatCurrency(dashboardStats.totalLoans)
                : "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats
                ? `${formatCurrency(dashboardStats.activeLoans)} active`
                : "Loading active loans"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats
                ? formatCurrency(dashboardStats.totalSavings)
                : "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats
                ? `+${dashboardStats.monthlyGrowth}% from last month`
                : "Loading growth data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats ? dashboardStats.totalMembers : "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground">
              Active microfinance members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Repayment Rate
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats
                ? `${dashboardStats.repaymentRate}%`
                : "Loading..."}
            </div>
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
            <CardDescription>
              Monthly loan disbursements vs collections
            </CardDescription>
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
                <Line
                  type="monotone"
                  dataKey="deposits"
                  stroke="#10b981"
                  name="Deposits"
                />
                <Line
                  type="monotone"
                  dataKey="withdrawals"
                  stroke="#ef4444"
                  name="Withdrawals"
                />
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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
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
