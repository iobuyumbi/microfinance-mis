import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  ClipboardList,
  UserCheck,
  Shield,
  TrendingUp,
  PiggyBank,
  Handshake,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
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
import { Progress } from "@/components/ui/progress";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "@/utils/formatters";
import { getStatusColor } from "@/utils/uiUtils";

const OfficerDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  // Mock data - replace with actual Redux state
  const [officerStats, setOfficerStats] = useState({
    pendingApplications: 15,
    completedAssessments: 8,
    activeGuarantors: 23,
    totalRepayments: 1250000,
    accountsManaged: 45,
    contributionsProcessed: 89000,
    chatSupportTickets: 12,
    monthlyTarget: 85,
    targetProgress: 72,
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: "loan_assessment",
      title: "Loan Assessment Completed",
      description: "Assessment for John Doe's loan application",
      amount: 50000,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: 2,
      type: "guarantor_approved",
      title: "Guarantor Approved",
      description: "Sarah Wilson approved as guarantor",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: 3,
      type: "repayment_collected",
      title: "Repayment Collected",
      description: "Monthly repayment from Mike Johnson",
      amount: 5000,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: 4,
      type: "chat_support",
      title: "Chat Support Request",
      description: "New support ticket from user",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: "pending",
    },
  ]);

  const [quickActions] = useState([
    {
      name: "Review Applications",
      icon: ClipboardList,
      href: "/officer/loan-applications",
      color: "bg-blue-500",
      count: officerStats.pendingApplications,
    },
    {
      name: "Conduct Assessments",
      icon: UserCheck,
      href: "/officer/loan-assessments",
      color: "bg-green-500",
      count: 5,
    },
    {
      name: "Manage Guarantors",
      icon: Shield,
      href: "/officer/guarantors",
      color: "bg-purple-500",
      count: officerStats.activeGuarantors,
    },
    {
      name: "Process Repayments",
      icon: TrendingUp,
      href: "/officer/repayments",
      color: "bg-orange-500",
      count: 8,
    },
    {
      name: "Chat Support",
      icon: MessageSquare,
      href: "/officer/chat",
      color: "bg-red-500",
      count: officerStats.chatSupportTickets,
    },
  ]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "loan_assessment":
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case "guarantor_approved":
        return <Shield className="h-4 w-4 text-purple-500" />;
      case "repayment_collected":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "chat_support":
        return <MessageSquare className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, Officer {user?.name}!
          </h1>
          <p className="text-gray-600">
            Manage loan applications, assessments, and client support.
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
            <CardTitle className="text-sm font-medium">
              Pending Applications
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {officerStats.pendingApplications}
            </div>
            <p className="text-xs text-muted-foreground">
              Require your attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Assessments
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {officerStats.completedAssessments}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Repayments
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(officerStats.totalRepayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Support Tickets
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {officerStats.chatSupportTickets}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Target Progress */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Target Progress</CardTitle>
            <CardDescription>Your performance this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{officerStats.targetProgress}%</span>
              </div>
              <Progress
                value={officerStats.targetProgress}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{officerStats.completedAssessments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Target</span>
                <span>{officerStats.monthlyTarget}</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              View Performance Report
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest work activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-medium">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => (window.location.href = action.href)}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}
                >
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{action.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.count} items
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>Accounts under your supervision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Accounts Managed</span>
              <span className="text-sm text-muted-foreground">
                {officerStats.accountsManaged}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Contributions Processed
              </span>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(officerStats.contributionsProcessed)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Guarantors</span>
              <span className="text-sm text-muted-foreground">
                {officerStats.activeGuarantors}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Success Rate</span>
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
            {officerStats.pendingApplications > 0 && (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {officerStats.pendingApplications} applications pending review
                </span>
              </div>
            )}
            {officerStats.chatSupportTickets > 0 && (
              <div className="flex items-center space-x-2 text-red-600">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">
                  {officerStats.chatSupportTickets} support tickets awaiting
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">All assessments up to date</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfficerDashboardPage;
