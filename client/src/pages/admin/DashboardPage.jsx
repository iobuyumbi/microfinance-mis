import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Users,
  Handshake,
  PiggyBank,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "@/utils/formatters";
import { getInitials, getRoleDisplayName } from "@/utils/userUtils";
import { getStatusColor } from "@/utils/uiUtils";

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Mock data - replace with actual Redux state
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeLoans: 89,
    totalSavings: 2450000,
    monthlyGrowth: 12.5,
    pendingApprovals: 23,
    overdueLoans: 7,
    totalGroups: 45,
    activeMeetings: 3,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "loan_approved",
      user: "John Doe",
      amount: 50000,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: 2,
      type: "new_user",
      user: "Jane Smith",
      amount: null,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "pending",
    },
    {
      id: 3,
      type: "repayment",
      user: "Mike Johnson",
      amount: 15000,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: 4,
      type: "loan_application",
      user: "Sarah Wilson",
      amount: 75000,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: "pending",
    },
  ]);

  const [quickActions] = useState([
    {
      name: "Add New User",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500",
    },
    {
      name: "Process Loan",
      icon: Handshake,
      href: "/admin/loans",
      color: "bg-green-500",
    },
    {
      name: "View Reports",
      icon: TrendingUp,
      href: "/admin/reports",
      color: "bg-purple-500",
    },
    {
      name: "Schedule Meeting",
      icon: Calendar,
      href: "/admin/meetings",
      color: "bg-orange-500",
    },
  ]);

  useEffect(() => {
    // Fetch dashboard data
    // dispatch(fetchDashboardStats());
    // dispatch(fetchRecentActivity());
  }, [dispatch]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "loan_approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "new_user":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "repayment":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "loan_application":
        return <Handshake className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case "loan_approved":
        return `Loan of ${formatCurrency(activity.amount)} approved for ${activity.user}`;
      case "new_user":
        return `New user ${activity.user} registered`;
      case "repayment":
        return `${activity.user} made a repayment of ${formatCurrency(activity.amount)}`;
      case "loan_application":
        return `${activity.user} applied for a loan of ${formatCurrency(activity.amount)}`;
      default:
        return "Activity recorded";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your microfinance system today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">{formatDate(new Date())}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.monthlyGrowth}%</span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{stats.overdueLoans} overdue</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Require your attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = action.href)}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mr-3`}
                >
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                {action.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getActivityDescription(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getActivityIcon(activity.type)}
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Groups</span>
              <span className="text-sm text-muted-foreground">
                {stats.totalGroups}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Meetings</span>
              <span className="text-sm text-muted-foreground">
                {stats.activeMeetings}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Loan Size</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(45000)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Repayment Rate</span>
              <span className="text-sm text-green-600">94.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.overdueLoans > 0 && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {stats.overdueLoans} loans are overdue
                </span>
              </div>
            )}
            {stats.pendingApprovals > 0 && (
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {stats.pendingApprovals} approvals pending
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">System running smoothly</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
