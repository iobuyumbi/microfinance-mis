import React, { useState, useEffect } from "react";
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
import { loanService } from "../services/loanService";
import { toast } from "sonner";
import { Link } from "react-router-dom";
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
  Loader2,
} from "lucide-react";

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isEditLoanOpen, setIsEditLoanOpen] = useState(false);
  const [loanStats, setLoanStats] = useState({
    totalLoans: 0,
    totalAmount: 0,
    approvedLoans: 0,
    pendingLoans: 0,
    rejectedLoans: 0,
  });

  /**
   * Fetch loans from API on component mount
   */
  useEffect(() => {
    fetchLoans();
  }, []);

  /**
   * Fetch loans from the API with optional search and filter parameters
   * @async
   */
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loanService.getLoans({
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });

      setLoans(response.data.data || []);

      // Calculate stats
      if (response.data) {
        const stats = {
          totalLoans: response.data.length,
          totalAmount: response.data.reduce(
            (sum, loan) => sum + parseFloat(loan.amount || 0),
            0
          ),
          approvedLoans: response.data.filter(
            (loan) => loan.status === "approved"
          ).length,
          pendingLoans: response.data.filter(
            (loan) => loan.status === "pending"
          ).length,
          rejectedLoans: response.data.filter(
            (loan) => loan.status === "rejected"
          ).length,
        };
        setLoanStats(stats);
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search and filter with debounce
   * Fetches loans when search term or filter status changes after a 500ms delay
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLoans();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  /**
   * Handle loan creation
   * @async
   * @param {Object} loanData - The loan data to be submitted
   */
  const handleCreateLoan = async (loanData) => {
    try {
      await loanService.createLoan(loanData);
      toast.success("Loan application submitted successfully");
      setIsNewLoanOpen(false);
      fetchLoans();
    } catch (error) {
      console.error("Error creating loan:", error);
      toast.error("Failed to submit loan application");
    }
  };

  /**
   * Handle loan update
   * @async
   * @param {Object} loanData - The updated loan data
   */
  const handleUpdateLoan = async (loanData) => {
    try {
      await loanService.updateLoan(selectedLoan.id, loanData);
      toast.success("Loan updated successfully");
      setIsEditLoanOpen(false);
      fetchLoans();
    } catch (error) {
      console.error("Error updating loan:", error);
      toast.error("Failed to update loan");
    }
  };

  /**
   * Handle loan approval
   * @async
   * @param {string|number} id - The ID of the loan to approve
   */
  const handleApproveLoan = async (id) => {
    try {
      await loanService.approveLoan(id, { status: "approved" });
      toast.success("Loan approved successfully");
      fetchLoans();
    } catch (error) {
      console.error("Error approving loan:", error);
      toast.error("Failed to approve loan");
    }
  };

  /**
   * Handle loan rejection
   * @async
   * @param {string|number} id - The ID of the loan to reject
   */
  const handleRejectLoan = async (id) => {
    try {
      await loanService.rejectLoan(id, { status: "rejected" });
      toast.success("Loan rejected");
      fetchLoans();
    } catch (error) {
      console.error("Error rejecting loan:", error);
      toast.error("Failed to reject loan");
    }
  };

  /**
   * Handle loan disbursement
   * @async
   * @param {string|number} id - The ID of the loan to disburse
   */
  const handleDisburseLoan = async (id) => {
    try {
      await loanService.disburseLoan(id, { disbursementDate: new Date() });
      toast.success("Loan disbursed successfully");
      fetchLoans();
    } catch (error) {
      console.error("Error disbursing loan:", error);
      toast.error("Failed to disburse loan");
    }
  };

  /**
   * Format amount to currency string
   * @param {number|string} amount - The amount to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (amount) => {
    if (!amount) return "$0";
    return typeof amount === "string" && amount.startsWith("$")
      ? amount
      : `$${parseFloat(amount).toFixed(2)}`;
  };

  /**
   * Format date string to localized date format
   * @param {string} dateString - The date string to format
   * @returns {string} Formatted date string or "N/A" if no date provided
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Get appropriate badge styling based on loan status
   * @param {string} status - The loan status
   * @returns {string} CSS class for the badge
   */
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
            Loans Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage loan applications, approvals, and repayments
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          onClick={() => setIsNewLoanOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Loan Application
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Loans"
          value={formatCurrency(loanStats.totalAmount)}
          description={`Across ${loanStats.totalLoans} loans`}
          icon={DollarSign}
          trend="up"
        />
        <StatsCard
          title="Pending Applications"
          value={loanStats.pendingLoans.toString()}
          description="Awaiting review"
          icon={Clock}
        />
        <StatsCard
          title="Approved Loans"
          value={loanStats.approvedLoans.toString()}
          description="Ready for disbursement"
          icon={CheckCircle}
        />
        <StatsCard
          title="Rejected Loans"
          value={loanStats.rejectedLoans.toString()}
          description="Not approved"
          icon={XCircle}
        />
      </div>

      {/* Quick Actions */}
      <FacebookCard className="border-2 border-blue-200">
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
      <FacebookCard className="border-2 border-blue-200">
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
                  type="search"
                  placeholder="Search by applicant or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 border-blue-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 px-4 border-2 border-blue-200 hover:border-purple-500"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {filterStatus === "all"
                    ? "All Status"
                    : filterStatus.charAt(0).toUpperCase() +
                      filterStatus.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Status
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
                <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("defaulted")}>
                  Defaulted
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Loans Table */}
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading loans...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && loans.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Loans Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Get started by creating your first loan application"}
              </p>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                onClick={() => setIsNewLoanOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> New Loan Application
              </Button>
            </div>
          )}

          {/* Loans Table */}
          {!loading && loans.length > 0 && (
            <div className="rounded-xl border-2 border-blue-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableHead className="font-semibold text-blue-900">
                      Applicant
                    </TableHead>
                    <TableHead className="font-semibold text-blue-900">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-blue-900">
                      Purpose
                    </TableHead>
                    <TableHead className="font-semibold text-blue-900">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-blue-900">
                      Application Date
                    </TableHead>
                    <TableHead className="text-right font-semibold text-blue-900">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const StatusIcon = getStatusIcon(loan.status);
                    return (
                      <TableRow
                        key={loan.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors"
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
                                Applied: {formatDate(loan.applicationDate)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(loan.amount)}
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
                            {formatDate(loan.applicationDate)}
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
                                <Link
                                  to={`/loans/${loan.id}`}
                                  className="flex items-center w-full"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setIsEditLoanOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Application
                              </DropdownMenuItem>
                              {loan.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleApproveLoan(loan.id)}
                                    className="text-green-600 dark:text-green-400"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRejectLoan(loan.id)}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {loan.status === "approved" && (
                                <DropdownMenuItem
                                  onClick={() => handleDisburseLoan(loan.id)}
                                >
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Disburse Loan
                                </DropdownMenuItem>
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
          )}
        </FacebookCardContent>
      </FacebookCard>

      {/* Recent Activity */}
      <FacebookCard className="border-2 border-blue-200">
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
      {/* Create Loan Modal */}
      <FormModal
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        title="New Loan Application"
      >
        <LoanForm onSubmit={handleCreateLoan} />
      </FormModal>

      {/* Edit Loan Modal */}
      <FormModal
        isOpen={isEditLoanOpen}
        onClose={() => setIsEditLoanOpen(false)}
        title="Edit Loan Application"
      >
        <LoanForm onSubmit={handleUpdateLoan} initialData={selectedLoan} />
      </FormModal>
    </div>
  );
};

export default LoansPage;
