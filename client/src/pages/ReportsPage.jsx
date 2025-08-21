import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  BarChart3,
  Users,
  DollarSign,
  PiggyBank,
  Building2,
  TrendingUp,
  FileText,
  CreditCard,
} from "lucide-react";
import FormModal from "../components/modals/FormModal";
import { reportService } from "../services/reportService";
import { formatCurrency, formatNumber } from "../utils/formatters";
import MemberList from "../components/lists/MemberList";
import LoanList from "../components/lists/LoanList";
import SavingsList from "../components/lists/SavingsList";
import GroupList from "../components/lists/GroupList";
import ActivityList from "../components/lists/ActivityList";
import TransactionList from "../components/lists/TransactionList";

const ReportsPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    totalMembers: 0,
    totalGroups: 0,
    approvedLoans: 0,
    totalSavings: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const resp = await reportService.getDashboardStats();
        const data = resp.data?.data || {};
        // Best-effort get transactions count via stats if available
        let totalTransactions = 0;
        try {
          const txStats = await (
            await import("../services/transactionService")
          ).transactionService.getStats();
          totalTransactions = txStats.data?.data?.totalTransactions || 0;
        } catch (_) {}
        setCounts({
          totalMembers: data.totalMembers || 0,
          totalGroups: data.totalGroups || 0,
          approvedLoans: data.approvedLoans || 0,
          totalSavings: data.totalSavings || 0,
          totalTransactions,
        });
      } catch (e) {
        // Non-fatal: keep zeros
        console.error("Failed loading report counts", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const reportSections = [
    {
      title: "Members Report",
      description: "View all registered members",
      icon: Users,
      color: "bg-blue-600",
      count: formatNumber(counts.totalMembers),
      modalContent: "members",
    },
    {
      title: "Loans Report",
      description: "Track loan applications",
      icon: DollarSign,
      color: "bg-green-600",
      count: formatNumber(counts.approvedLoans),
      modalContent: "loans",
    },
    {
      title: "Savings Report",
      description: "Monitor savings accounts",
      icon: PiggyBank,
      color: "bg-purple-600",
      count: formatCurrency(counts.totalSavings, "USD"),
      modalContent: "savings",
    },
    {
      title: "Groups Report",
      description: "View all groups",
      icon: Building2,
      color: "bg-orange-600",
      count: formatNumber(counts.totalGroups),
      modalContent: "groups",
    },
    {
      title: "Activity Report",
      description: "View recent activities",
      icon: BarChart3,
      color: "bg-indigo-600",
      count: "—",
      modalContent: "activity",
    },
    {
      title: "Transactions Report",
      description: "View all transactions",
      icon: CreditCard,
      color: "bg-teal-600",
      count: formatNumber(counts.totalTransactions),
      modalContent: "transactions",
    },
  ];

  const getModalContent = () => {
    switch (activeModal) {
      case "members":
        return <MemberList />;
      case "loans":
        return <LoanList />;
      case "savings":
        return <SavingsList />;
      case "groups":
        return <GroupList />;
      case "activity":
        return <ActivityList />;
      case "transactions":
        return <TransactionList />;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case "members":
        return "Members Report";
      case "loans":
        return "Loans Report";
      case "savings":
        return "Savings Report";
      case "groups":
        return "Groups Report";
      case "activity":
        return "Activity Report";
      case "transactions":
        return "Transactions Report";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your platform
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {reportSections.map((section, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setActiveModal(section.modalContent)}
          >
            <CardHeader>
              <div className={`p-3 rounded-lg ${section.color} w-fit`}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {section.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{section.count}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

export default ReportsPage;
