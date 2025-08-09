import React, { useState } from "react";
import { StatsCard } from "../components/ui/stats-card";
import {
  FacebookCard,
  FacebookCardHeader,
  FacebookCardContent,
} from "../components/ui/facebook-card";
import { ActionButton } from "../components/ui/action-button";
import { ActivityItem } from "../components/ui/activity-item";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import FormModal from "../components/modals/FormModal";
import LoanForm from "../components/forms/LoanForm";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";

const LoansPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);

  // Mock data - replace with actual API calls
  const loans = [
    {
      id: 1,
      applicant: "John Doe",
      amount: "$5,000",
      purpose: "Business Expansion",
      status: "approved",
      applicationDate: "2024-01-15",
      approvalDate: "2024-01-20",
      term: "12 months",
      interestRate: "8.5%",
      monthlyPayment: "$450",
      nextPayment: "2024-02-15",
      remainingBalance: "$4,550",
    },
    {
      id: 2,
      applicant: "Jane Smith",
      amount: "$3,000",
      purpose: "Home Renovation",
      status: "pending",
      applicationDate: "2024-01-18",
      approvalDate: null,
      term: "24 months",
      interestRate: "7.5%",
      monthlyPayment: "$135",
      nextPayment: null,
      remainingBalance: null,
    },
    {
      id: 3,
      applicant: "Mike Johnson",
      amount: "$2,500",
      purpose: "Education",
      status: "rejected",
      applicationDate: "2024-01-10",
      approvalDate: "2024-01-12",
      term: "18 months",
      interestRate: "9.0%",
      monthlyPayment: "$150",
      nextPayment: null,
      remainingBalance: null,
    },
    {
      id: 4,
      applicant: "Sarah Wilson",
      amount: "$7,500",
      purpose: "Equipment Purchase",
      status: "active",
      applicationDate: "2023-12-01",
      approvalDate: "2023-12-05",
      term: "36 months",
      interestRate: "6.5%",
      monthlyPayment: "$230",
      nextPayment: "2024-02-01",
      remainingBalance: "$6,900",
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      active:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    };
    return (
      <Badge
        className={
          variants[status] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
      >
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      case "active":
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      title: "Total Loans",
      value: loans.length.toString(),
      change: "+15%",
      changeType: "positive",
      icon: DollarSign,
    },
    {
      title: "Active Loans",
      value: loans.filter((l) => l.status === "active").length.toString(),
      change: "+8%",
      changeType: "positive",
      icon: CheckCircle,
    },
    {
      title: "Pending Applications",
      value: loans.filter((l) => l.status === "pending").length.toString(),
      change: "+12%",
      changeType: "positive",
      icon: Clock,
    },
    {
      title: "Total Disbursed",
      value: "$18,000",
      change: "+23%",
      changeType: "positive",
      icon: TrendingUp,
    },
  ];

  const quickActions = [
    {
      title: "New Loan Application",
      description: "Create a new loan application",
      icon: Plus,
      onClick: () => console.log("New loan application"),
      variant: "default",
    },
    {
      title: "Bulk Approval",
      description: "Approve multiple applications",
      icon: CheckCircle,
      onClick: () => console.log("Bulk approval"),
      variant: "success",
    },
    {
      title: "Payment Collection",
      description: "Record loan payments",
      icon: CreditCard,
      onClick: () => console.log("Payment collection"),
      variant: "purple",
    },
  ];

  const recentActivities = [
    {
      icon: CheckCircle,
      title: "Loan approved",
      description: "John Doe's $5,000 business loan approved",
      time: "2 hours ago",
      variant: "success",
    },
    {
      icon: Clock,
      title: "Application received",
      description: "New application from Jane Smith",
      time: "1 day ago",
      variant: "warning",
    },
    {
      icon: CreditCard,
      title: "Payment received",
      description: "$450 payment from Sarah Wilson",
      time: "3 days ago",
      variant: "default",
    },
    {
      icon: XCircle,
      title: "Application rejected",
      description: "Mike Johnson's application rejected",
      time: "1 week ago",
      variant: "danger",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Loans
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage loan applications and track loan status
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => setIsNewLoanOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Loan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
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
            <DollarSign className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <ActionButton
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.onClick}
                variant={action.variant}
              />
            ))}
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Loan Applications */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Loan Applications
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View and manage all loan applications
              </p>
            </div>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by applicant or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 px-4">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Applications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("approved")}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("rejected")}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Loans Table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Applicant
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Purpose
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Term
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Monthly Payment
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Next Payment
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 dark:text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => {
                  const StatusIcon = getStatusIcon(loan.status);
                  return (
                    <TableRow
                      key={loan.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {loan.applicant.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {loan.applicant}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Applied: {loan.applicationDate}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {loan.amount}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {loan.interestRate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-900 dark:text-white">
                          {loan.purpose}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          {getStatusBadge(loan.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-900 dark:text-white">
                          {loan.term}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {loan.monthlyPayment}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="mr-2 h-4 w-4" />
                          {loan.nextPayment || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Application
                            </DropdownMenuItem>
                            {loan.status === "pending" && (
                              <>
                                <DropdownMenuItem className="text-green-600 dark:text-green-400">
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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

      {/* New Loan Modal */}
      <FormModal
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        title="New Loan Application"
      >
        <LoanForm />
      </FormModal>
    </div>
  );
};

export default LoansPage;
