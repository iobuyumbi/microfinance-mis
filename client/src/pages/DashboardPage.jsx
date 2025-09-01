import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Plus,
  Calendar,
  AlertCircle,
  CreditCard,
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { dashboardService } from "../services/dashboardService";
import { useSocket } from "../context/SocketContext";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalLoans: 0,
    totalSavings: 0,
    totalGroups: 0,
    recentTransactions: [],
    loanStatus: [],
    monthlyData: [],
    weeklyData: [],
    alerts: [],
    performanceMetrics: {},
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const { socket } = useSocket();

  useEffect(() => {
    fetchDashboardData();

    // Socket listeners for real-time updates
    if (socket) {
      socket.on("transaction_created", handleTransactionUpdate);
      socket.on("loan_status_changed", handleLoanUpdate);
      socket.on("member_joined", handleMemberUpdate);

      return () => {
        socket.off("transaction_created");
        socket.off("loan_status_changed");
        socket.off("member_joined");
      };
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardStats(timeRange);
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");

      // Fallback to mock data for development
      setStats({
        totalMembers: 250,
        totalLoans: 45,
        totalSavings: 125000,
        totalGroups: 12,
        recentTransactions: [
          {
            id: 1,
            type: "loan_disbursement",
            amount: 5000,
            member: "John Doe",
            date: "2024-01-15",
            status: "completed",
          },
          {
            id: 2,
            type: "savings_deposit",
            amount: 1200,
            member: "Jane Smith",
            date: "2024-01-14",
            status: "completed",
          },
          {
            id: 3,
            type: "loan_repayment",
            amount: 800,
            member: "Mike Johnson",
            date: "2024-01-13",
            status: "pending",
          },
        ],
        loanStatus: [
          { name: "Active", value: 25, color: "#10B981" },
          { name: "Pending", value: 12, color: "#F59E0B" },
          { name: "Completed", value: 8, color: "#6366F1" },
          { name: "Overdue", value: 3, color: "#EF4444" },
        ],
        monthlyData: [
          { month: "Jan", loans: 4000, savings: 2400, members: 45 },
          { month: "Feb", loans: 3000, savings: 1398, members: 52 },
          { month: "Mar", loans: 2000, savings: 9800, members: 48 },
          { month: "Apr", loans: 2780, savings: 3908, members: 61 },
          { month: "May", loans: 1890, savings: 4800, members: 55 },
          { month: "Jun", loans: 2390, savings: 3800, members: 67 },
        ],
        weeklyData: [
          { day: "Mon", transactions: 12, amount: 3400 },
          { day: "Tue", transactions: 8, amount: 2100 },
          { day: "Wed", transactions: 15, amount: 4200 },
          { day: "Thu", transactions: 10, amount: 1800 },
          { day: "Fri", transactions: 18, amount: 5600 },
          { day: "Sat", transactions: 6, amount: 1200 },
          { day: "Sun", transactions: 4, amount: 800 },
        ],
        alerts: [
          {
            id: 1,
            type: "warning",
            message: "3 loans are overdue",
            action: "View Details",
            timestamp: "2024-01-15T10:30:00Z",
          },
          {
            id: 2,
            type: "info",
            message: "Weekly group meeting scheduled for tomorrow",
            action: "View Calendar",
            timestamp: "2024-01-15T08:15:00Z",
          },
        ],
        performanceMetrics: {
          loanRepaymentRate: 92.5,
          memberGrowthRate: 8.3,
          savingsGrowthRate: 15.2,
          portfolioQuality: 96.1,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard data refreshed");
  };

  const handleTransactionUpdate = (data) => {
    setStats(prev => ({
      ...prev,
      recentTransactions: [data, ...prev.recentTransactions.slice(0, 4)]
    }));
    toast.info("New transaction recorded");
  };

  const handleLoanUpdate = (data) => {
    // Update loan status in real-time
    fetchDashboardData();
  };

  const handleMemberUpdate = (data) => {
    setStats(prev => ({
      ...prev,
      totalMembers: prev.totalMembers + 1
    }));
    toast.success("New member joined");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "loan_disbursement":
        return <CreditCard className="h-4 w-4" />;
      case "savings_deposit":
        return <Wallet className="h-4 w-4" />;
      case "loan_repayment":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (value) => {
    return value >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (value) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your microfinance overview.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {stats.alerts && stats.alerts.length > 0 && (
        <div className="grid gap-4">
          {stats.alerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    {alert.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.performanceMetrics?.memberGrowthRate || 8.3)}
              <span className={getTrendColor(stats.performanceMetrics?.memberGrowthRate || 8.3)}>
                +{stats.performanceMetrics?.memberGrowthRate || 8.3}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoans}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(5)}
              <span className={getTrendColor(5)}>+5%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSavings)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(stats.performanceMetrics?.savingsGrowthRate || 15.2)}
              <span className={getTrendColor(stats.performanceMetrics?.savingsGrowthRate || 15.2)}>
                +{stats.performanceMetrics?.savingsGrowthRate || 15.2}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(2)}
              <span className={getTrendColor(2)}>+2</span>
              <span>new this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Repayment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.performanceMetrics?.loanRepaymentRate || 92.5}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.performanceMetrics?.portfolioQuality || 96.1}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Member Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              +{stats.performanceMetrics?.memberGrowthRate || 8.3}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Savings Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              +{stats.performanceMetrics?.savingsGrowthRate || 15.2}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Monthly Overview */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="loans"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorLoans)"
                  name="Loans"
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorSavings)"
                  name="Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Status */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Loan Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats.loanStatus}
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
                  {stats.loanStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Transaction Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.member}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.type.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;