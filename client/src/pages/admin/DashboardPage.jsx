import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  RefreshCw,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/useApi";
import { dashboardService } from "@/services/dashboardService";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "@/utils/formatters";
import { getInitials, getRoleDisplayName } from "@/utils/userUtils";
import { getStatusColor } from "@/utils/uiUtils";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // API hooks for dashboard data
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    execute: fetchStats,
  } = useApi(dashboardService.getStats, {
    showErrorToast: true,
    errorMessage: "Failed to load dashboard statistics",
  });

  const {
    data: recentActivity,
    loading: activityLoading,
    error: activityError,
    execute: fetchActivity,
  } = useApi(dashboardService.getRecentActivity, {
    showErrorToast: true,
    errorMessage: "Failed to load recent activity",
  });

  const {
    data: upcomingPayments,
    loading: paymentsLoading,
    error: paymentsError,
    execute: fetchPayments,
  } = useApi(dashboardService.getUpcomingPayments, {
    showErrorToast: true,
    errorMessage: "Failed to load upcoming payments",
  });

  const {
    data: defaulters,
    loading: defaultersLoading,
    error: defaultersError,
    execute: fetchDefaulters,
  } = useApi(dashboardService.getLoanDefaulters, {
    showErrorToast: true,
    errorMessage: "Failed to load loan defaulters",
  });

  // Load data on component mount
  React.useEffect(() => {
    fetchStats();
    fetchActivity();
    fetchPayments();
    fetchDefaulters();
  }, [fetchStats, fetchActivity, fetchPayments, fetchDefaulters]);

  const quickActions = [
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
  ];

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

  const handleQuickAction = (href) => {
    navigate(href);
  };

  const handleRefresh = () => {
    fetchStats();
    fetchActivity();
    fetchPayments();
    fetchDefaulters();
  };

  // Loading skeleton component
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ActivitySkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );

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
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium">{formatDate(new Date())}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={
              statsLoading ||
              activityLoading ||
              paymentsLoading ||
              defaultersLoading
            }
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${statsLoading || activityLoading || paymentsLoading || defaultersLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : statsError ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            Failed to load dashboard statistics
          </p>
          <Button onClick={fetchStats} variant="outline">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalUsers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{stats?.monthlyGrowth || 0}%
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Loans
              </CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeLoans || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">
                  {stats?.overdueLoans || 0} overdue
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Savings
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalSavings || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{stats?.savingsGrowth || 0}%
                </span>{" "}
                from last month
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
              <div className="text-2xl font-bold">
                {stats?.pendingApprovals || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Require your attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
                onClick={() => handleQuickAction(action.href)}
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
            {activityLoading ? (
              <ActivitySkeleton />
            ) : activityError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm">
                  Failed to load recent activity
                </p>
                <Button
                  onClick={fetchActivity}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity?.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user?.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(activity.user?.name || activity.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getActivityDescription(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(new Date(activity.timestamp))}
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            )}
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
                {stats?.totalGroups || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Meetings</span>
              <span className="text-sm text-muted-foreground">
                {stats?.activeMeetings || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Loan Size</span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(stats?.averageLoanSize || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Repayment Rate</span>
              <span className="text-sm text-green-600">
                {stats?.repaymentRate || 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : defaultersError ? (
              <div className="text-center py-4">
                <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm">Failed to load alerts</p>
              </div>
            ) : (
              <>
                {defaulters?.length > 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {defaulters.length} loans are overdue
                    </span>
                  </div>
                )}
                {stats?.pendingApprovals > 0 && (
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
