import React, { useState, useEffect } from "react";
import { StatsCard } from "../components/ui/stats-card";
import { ActionButton } from "../components/ui/action-button";
import { ActivityItem } from "../components/ui/activity-item";
import {
  FacebookCard,
  FacebookCardHeader,
  FacebookCardContent,
} from "../components/ui/facebook-card";
import {
  Users,
  DollarSign,
  PiggyBank,
  Building2,
  Plus,
  CreditCard,
  TrendingUp,
  Calendar,
  MessageCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import FormModal from "../components/modals/FormModal";
import LoanForm from "../components/forms/LoanForm";
import SavingsForm from "../components/forms/SavingsForm";
import MemberForm from "../components/forms/MemberForm";
import GroupForm from "../components/forms/GroupForm";
import TransactionForm from "../components/forms/TransactionForm";
import { dashboardService } from "../services/dashboardService";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "sonner";

const DashboardPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeLoans: 0,
    totalSavings: 0,
    totalGroups: 0,
    overdueLoans: 0,
    pendingLoans: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData, paymentsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(),
        dashboardService.getUpcomingPayments(),
      ]);

      if (statsData.data?.success) {
        const data = statsData.data.data;
        setStats({
          totalMembers: data.totalMembers || 0,
          activeLoans: data.approvedLoans || 0,
          totalSavings: data.totalSavings || 0,
          totalGroups: data.totalGroups || 0,
          overdueLoans: data.overduePaymentsCount || 0,
          pendingLoans: data.pendingLoans || 0,
        });
      }

      if (activitiesData.data?.success) {
        setRecentActivities(activitiesData.data.data || []);
      }

      if (paymentsData.data?.success) {
        setUpcomingPayments(paymentsData.data.data || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Members",
      value: stats.totalMembers.toLocaleString(),
      change: "+12%",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Active Loans",
      value: stats.activeLoans.toLocaleString(),
      change:
        stats.pendingLoans > 0
          ? `${stats.pendingLoans} pending`
          : "All processed",
      changeType: stats.pendingLoans > 0 ? "warning" : "positive",
      icon: DollarSign,
    },
    {
      title: "Total Savings",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(stats.totalSavings),
      change: "+15%",
      changeType: "positive",
      icon: PiggyBank,
    },
    {
      title: "Groups",
      value: stats.totalGroups.toLocaleString(),
      change:
        stats.overdueLoans > 0
          ? `${stats.overdueLoans} overdue`
          : "All current",
      changeType: stats.overdueLoans > 0 ? "negative" : "positive",
      icon: Building2,
    },
  ];

  const quickActions = [
    {
      title: "Apply for Loan",
      description: "Submit a new loan application",
      icon: DollarSign,
      action: () => setActiveModal("loan"),
      variant: "default",
    },
    {
      title: "Make Contribution",
      description: "Record a savings contribution",
      icon: PiggyBank,
      action: () => setActiveModal("savings"),
      variant: "success",
    },
    {
      title: "Register Member",
      description: "Add a new member",
      icon: Users,
      action: () => setActiveModal("member"),
      variant: "purple",
    },
    {
      title: "Create Group",
      description: "Form a new group",
      icon: Building2,
      action: () => setActiveModal("group"),
      variant: "warning",
    },
    {
      title: "New Transaction",
      description: "Create a new transaction",
      icon: CreditCard,
      action: () => setActiveModal("transaction"),
      variant: "teal",
    },
  ];

  const getModalContent = () => {
    switch (activeModal) {
      case "loan":
        return (
          <LoanForm
            onSuccess={() => {
              setActiveModal(null);
              loadDashboardData();
            }}
          />
        );
      case "savings":
        return (
          <SavingsForm
            onSuccess={() => {
              setActiveModal(null);
              loadDashboardData();
            }}
          />
        );
      case "member":
        return (
          <MemberForm
            onSuccess={() => {
              setActiveModal(null);
              loadDashboardData();
            }}
          />
        );
      case "group":
        return (
          <GroupForm
            onSuccess={() => {
              setActiveModal(null);
              loadDashboardData();
            }}
          />
        );
      case "transaction":
        return (
          <TransactionForm
            onSuccess={() => {
              setActiveModal(null);
              loadDashboardData();
            }}
          />
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case "loan":
        return "Apply for Loan";
      case "savings":
        return "Make Savings Contribution";
      case "member":
        return "Register Member";
      case "group":
        return "Create Group";
      case "transaction":
        return "New Transaction";
      default:
        return "";
    }
  };

  const formatActivity = (activity) => {
    const icons = {
      loan_approved: DollarSign,
      loan_created: DollarSign,
      contribution: PiggyBank,
      withdrawal: PiggyBank,
      member_joined: Users,
      group_created: Building2,
      repayment: CreditCard,
      meeting: Calendar,
    };

    const variants = {
      loan_approved: "success",
      loan_created: "default",
      contribution: "purple",
      withdrawal: "warning",
      member_joined: "default",
      group_created: "warning",
      repayment: "success",
      meeting: "teal",
    };

    return {
      icon: icons[activity.type] || TrendingUp,
      title: activity.title || activity.description,
      description: activity.description || activity.title,
      time: activity.createdAt
        ? new Date(activity.createdAt).toLocaleDateString()
        : "Recently",
      variant: variants[activity.type] || "default",
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || "User"}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your microfinance platform today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <ActionButton
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.action}
                variant={action.variant}
              />
            ))}
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Recent Activity */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity, index) => {
                const formattedActivity = formatActivity(activity);
                return (
                  <ActivityItem
                    key={index}
                    icon={formattedActivity.icon}
                    title={formattedActivity.title}
                    description={formattedActivity.description}
                    time={formattedActivity.time}
                    variant={formattedActivity.variant}
                  />
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                No recent activity to display
              </div>
            )}
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <FacebookCard>
          <FacebookCardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Payments
              </h2>
            </div>
          </FacebookCardHeader>
          <FacebookCardContent>
            <div className="space-y-3">
              {upcomingPayments.slice(0, 5).map((payment, index) => (
                <ActivityItem
                  key={index}
                  icon={DollarSign}
                  title={`Payment Due: ${payment.borrower?.name || "Unknown"}`}
                  description={`${new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(payment.amount)} due on ${new Date(
                    payment.dueDate
                  ).toLocaleDateString()}`}
                  time={new Date(payment.dueDate).toLocaleDateString()}
                  variant={
                    new Date(payment.dueDate) < new Date()
                      ? "negative"
                      : "warning"
                  }
                />
              ))}
            </div>
          </FacebookCardContent>
        </FacebookCard>
      )}

      {/* Modal */}
      <FormModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={getModalTitle()}
      >
        {getModalContent()}
      </FormModal>
    </div>
  );
};

export default DashboardPage;
