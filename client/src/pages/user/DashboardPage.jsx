import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Handshake,
  PiggyBank,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
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

const UserDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  // Mock data - replace with actual Redux state
  const [userStats, setUserStats] = useState({
    totalSavings: 125000,
    activeLoan: 50000,
    loanBalance: 35000,
    nextPayment: 5000,
    nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    groupContribution: 15000,
    totalContributed: 45000,
    contributionProgress: 75,
    upcomingMeetings: 2,
    recentTransactions: 8,
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      type: "savings_deposit",
      amount: 5000,
      description: "Monthly savings contribution",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: 2,
      type: "loan_repayment",
      amount: 3000,
      description: "Loan repayment",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: 3,
      type: "group_contribution",
      amount: 2000,
      description: "Group meeting contribution",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "completed",
    },
  ]);

  const [upcomingMeetings, setUpcomingMeetings] = useState([
    {
      id: 1,
      title: "Monthly Group Meeting",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: "10:00 AM",
      location: "Community Hall",
      contribution: 2000,
    },
    {
      id: 2,
      title: "Loan Review Meeting",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: "2:00 PM",
      location: "Office",
      contribution: 0,
    },
  ]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "savings_deposit":
        return <PiggyBank className="h-4 w-4 text-green-500" />;
      case "loan_repayment":
        return <Handshake className="h-4 w-4 text-blue-500" />;
      case "group_contribution":
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionDescription = (transaction) => {
    switch (transaction.type) {
      case "savings_deposit":
        return `Deposited ${formatCurrency(transaction.amount)} to savings`;
      case "loan_repayment":
        return `Repaid ${formatCurrency(transaction.amount)} on loan`;
      case "group_contribution":
        return `Contributed ${formatCurrency(transaction.amount)} to group`;
      default:
        return transaction.description;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's your financial overview and upcoming activities.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">{formatDate(new Date())}</p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(userStats.totalSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loan</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(userStats.activeLoan)}
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {formatCurrency(userStats.loanBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(userStats.nextPayment)}
            </div>
            <p className="text-xs text-muted-foreground">
              Due {formatDate(userStats.nextPaymentDate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Group Contribution
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(userStats.groupContribution)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's contribution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contribution Progress */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Contribution Progress</CardTitle>
            <CardDescription>Your annual contribution target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{userStats.contributionProgress}%</span>
              </div>
              <Progress
                value={userStats.contributionProgress}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Contributed</span>
                <span>{formatCurrency(userStats.totalContributed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Target</span>
                <span>{formatCurrency(60000)}</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Make Contribution
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getTransactionDescription(transaction)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(transaction.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {transaction.type === "loan_repayment" ? "-" : "+"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Your scheduled group activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center space-x-4 p-3 border rounded-lg"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(meeting.date)} at {meeting.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {meeting.location}
                    </p>
                  </div>
                  {meeting.contribution > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium">Contribution</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(meeting.contribution)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <PiggyBank className="mr-2 h-4 w-4" />
              Make Savings Deposit
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Handshake className="mr-2 h-4 w-4" />
              Make Loan Repayment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              View Group Details
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts & Notifications</CardTitle>
          <CardDescription>Important updates and reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 text-orange-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Next loan payment due in 7 days</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              Group meeting scheduled for next week
            </span>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              Your savings account is in good standing
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboardPage;
