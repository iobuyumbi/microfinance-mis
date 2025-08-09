import React, { useState } from "react";
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
} from "lucide-react";
import FormModal from "../components/modals/FormModal";
import LoanForm from "../components/forms/LoanForm";
import SavingsForm from "../components/forms/SavingsForm";
import MemberForm from "../components/forms/MemberForm";
import GroupForm from "../components/forms/GroupForm";
import TransactionForm from "../components/forms/TransactionForm";

const DashboardPage = () => {
  const [activeModal, setActiveModal] = useState(null);

  const stats = [
    {
      title: "Total Members",
      value: "1,234",
      change: "+12%",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Active Loans",
      value: "567",
      change: "+8%",
      changeType: "positive",
      icon: DollarSign,
    },
    {
      title: "Total Savings",
      value: "$45,678",
      change: "+15%",
      changeType: "positive",
      icon: PiggyBank,
    },
    {
      title: "Groups",
      value: "89",
      change: "+3%",
      changeType: "positive",
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
      title: "Create Savings",
      description: "Open a new savings account",
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

  const recentActivities = [
    {
      icon: Users,
      title: "New member registered",
      description: "John Doe joined the platform",
      time: "2 hours ago",
      variant: "default",
    },
    {
      icon: DollarSign,
      title: "Loan approved",
      description: "Business loan for $5,000 approved",
      time: "1 day ago",
      variant: "success",
    },
    {
      icon: PiggyBank,
      title: "Savings deposit",
      description: "$500 deposited to emergency fund",
      time: "3 days ago",
      variant: "purple",
    },
    {
      icon: Calendar,
      title: "Group meeting scheduled",
      description: "Monthly meeting for Group A",
      time: "1 week ago",
      variant: "warning",
    },
  ];

  const getModalContent = () => {
    switch (activeModal) {
      case "loan":
        return <LoanForm />;
      case "savings":
        return <SavingsForm />;
      case "member":
        return <MemberForm />;
      case "group":
        return <GroupForm />;
      case "transaction":
        return <TransactionForm />;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case "loan":
        return "Apply for Loan";
      case "savings":
        return "Create Savings Account";
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-blue-100">
          Here's what's happening with your microfinance platform today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
            {recentActivities.map((activity, index) => (
              <ActivityItem
                key={index}
                icon={activity.icon}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                variant={activity.variant}
              />
            ))}
          </div>
        </FacebookCardContent>
      </FacebookCard>

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
