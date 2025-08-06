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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Building2,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { ENDPOINTS } from "@/services/api/endpoints";

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const { getDashboardReport, getReports, loading } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardResult, activitiesResult] = await Promise.all([
        getDashboardReport(),
        getReports(ENDPOINTS.REPORTS.RECENT_ACTIVITY),
      ]);

      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
      }

      if (activitiesResult.success) {
        setRecentActivities(activitiesResult.data.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const getStatsCards = () => {
    if (!dashboardData) return [];

    const baseStats = [
      {
        title: "Total Members",
        value: dashboardData.totalMembers || 0,
        change: dashboardData.memberGrowth || 0,
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Active Loans",
        value: dashboardData.activeLoans || 0,
        change: dashboardData.loanGrowth || 0,
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Total Savings",
        value: `$${(dashboardData.totalSavings || 0).toLocaleString()}`,
        change: dashboardData.savingsGrowth || 0,
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Upcoming Meetings",
        value: dashboardData.upcomingMeetings || 0,
        change: 0,
        icon: Calendar,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
    ];

    // Add role-specific stats
    if (hasRole(["admin", "officer"])) {
      baseStats.push({
        title: "Pending Approvals",
        value: dashboardData.pendingApprovals || 0,
        change: 0,
        icon: Clock,
        color: "text-red-600",
        bgColor: "bg-red-50",
      });
    }

    if (hasRole("admin")) {
      baseStats.push({
        title: "Total Groups",
        value: dashboardData.totalGroups || 0,
        change: dashboardData.groupGrowth || 0,
        icon: Building2,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      });
    }

    return baseStats;
  };

  const getQuickActions = () => {
    const actions = [];

    if (hasRole(["admin", "officer"])) {
      actions.push(
        {
          title: "Add Member",
          icon: Plus,
          href: "/members/create",
          color: "bg-blue-500",
        },
        {
          title: "Create Group",
          icon: Building2,
          href: "/groups/create",
          color: "bg-green-500",
        },
        {
          title: "Approve Loans",
          icon: CheckCircle,
          href: "/loans",
          color: "bg-purple-500",
        }
      );
    }

    if (hasRole(["admin", "officer", "leader"])) {
      actions.push(
        {
          title: "Schedule Meeting",
          icon: Calendar,
          href: "/meetings/create",
          color: "bg-orange-500",
        },
        {
          title: "View Reports",
          icon: FileText,
          href: "/reports",
          color: "bg-indigo-500",
        }
      );
    }

    actions.push({
      title: "View Profile",
      icon: Eye,
      href: "/profile",
      color: "bg-gray-500",
    });

    return actions;
  };

  const getRoleBasedContent = () => {
    if (hasRole("admin")) {
      return {
        title: "Admin Dashboard",
        description: "Manage the entire microfinance system",
        tabs: [
          { value: "overview", label: "Overview" },
          { value: "financials", label: "Financials" },
          { value: "operations", label: "Operations" },
          { value: "reports", label: "Reports" },
        ],
      };
    }

    if (hasRole("officer")) {
      return {
        title: "Officer Dashboard",
        description: "Manage your assigned groups and members",
        tabs: [
          { value: "overview", label: "Overview" },
          { value: "groups", label: "My Groups" },
          { value: "loans", label: "Loan Management" },
          { value: "reports", label: "Reports" },
        ],
      };
    }

    if (hasRole("leader")) {
      return {
        title: "Group Leader Dashboard",
        description: "Manage your group activities",
        tabs: [
          { value: "overview", label: "Overview" },
          { value: "members", label: "Group Members" },
          { value: "meetings", label: "Meetings" },
          { value: "contributions", label: "Contributions" },
        ],
      };
    }

    return {
      title: "Member Dashboard",
      description: "View your account and activities",
      tabs: [
        { value: "overview", label: "Overview" },
        { value: "loans", label: "My Loans" },
        { value: "savings", label: "My Savings" },
        { value: "transactions", label: "Transactions" },
      ],
    };
  };

  const content = getRoleBasedContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
          <p className="text-gray-600 mt-1">{content.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <Badge variant="secondary" className="text-xs capitalize">
              {user?.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getStatsCards().map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.change !== 0 && (
                      <div className="flex items-center mt-1">
                        {stat.change > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm ml-1 ${stat.change > 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {Math.abs(stat.change)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {getQuickActions().map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => (window.location.href = action.href)}
                >
                  <Icon
                    className={`h-6 w-6 ${action.color.replace("bg-", "text-")}`}
                  />
                  <span className="text-xs text-center">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          {content.tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Loan Repayment Rate</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Member Retention</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Meeting Attendance</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tab contents would be implemented based on the specific needs */}
        {content.tabs.slice(1).map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardHeader>
                <CardTitle>{tab.label}</CardTitle>
                <CardDescription>
                  Content for {tab.label.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This section will contain {tab.label.toLowerCase()} specific
                  content.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DashboardPage;
