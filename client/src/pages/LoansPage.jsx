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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import FormModal from "../components/modals/FormModal";
import LoanForm from "../components/forms/LoanForm";
import { financialService } from "../services/financialService";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { PageHeader } from "../components/custom/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  RefreshCw,
  Building2,
  AlertTriangle,
  Shield,
} from "lucide-react";

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBorrowerType, setFilterBorrowerType] = useState("all");
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isEditLoanOpen, setIsEditLoanOpen] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [loanStats, setLoanStats] = useState({
    totalLoans: 0,
    totalAmount: 0,
    approvedLoans: 0,
    pendingLoans: 0,
    disbursedLoans: 0,
    overdueLoans: 0,
    averageLoanAmount: 0,
    portfolioHealth: 0,
  });
  const [portfolioAnalysis, setPortfolioAnalysis] = useState({});
  const { user } = useAuth();

  /**
   * Fetch loans from API on component mount
   */
  useEffect(() => {
    fetchLoans();
    fetchLoanStats();
  }, []);

  /**
   * Filter loans based on search term and filters
   */
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterStatus !== "all") params.status = filterStatus;
    if (filterBorrowerType !== "all") params.borrowerModel = filterBorrowerType;
    fetchLoans(params);
  }, [searchTerm, filterStatus, filterBorrowerType]);

  /**
   * Fetch loans from the API with optional search and filter parameters
   * @async
   */
  const fetchLoans = async (params = {}) => {
    try {
      setLoading(true);
      const response = await financialService.getLoanPortfolio(params);
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setLoans(data);
    } catch (error) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch loan statistics and portfolio analysis
   */
  const fetchLoanStats = async () => {
    try {
      const [statsResponse, defaultersResponse] = await Promise.all([
        financialService.getLoanStats(),
        financialService.getLoanDefaulters(),
      ]);

      const stats = statsResponse.data?.data || {};
      const defaulters = defaultersResponse.data?.data || [];

      // Calculate portfolio analysis
      const analysis = financialService.analyzePortfolio(loans);
      setPortfolioAnalysis(analysis);

      setLoanStats({
        totalLoans: stats.totalLoans || 0,
        totalAmount: stats.totalAmount || 0,
        approvedLoans: stats.approvedLoans || 0,
        pendingLoans: stats.pendingLoans || 0,
        disbursedLoans: stats.disbursedLoans || 0,
        overdueLoans: defaulters.length,
        averageLoanAmount: stats.averageLoanAmount || 0,
        portfolioHealth: analysis.completionRate || 0,
      });
    } catch (error) {
      console.error("Error fetching loan stats:", error);
    }
  };

  const handleCreateLoan = () => {
    setIsNewLoanOpen(true);
  };

  const handleEditLoan = (loan) => {
    setSelectedLoan(loan);
    setIsEditLoanOpen(true);
  };

  const handleViewLoanDetails = (loan) => {
    setSelectedLoan(loan);
    setShowLoanDetails(true);
  };

  const handleLoanSuccess = () => {
    setIsNewLoanOpen(false);
    setIsEditLoanOpen(false);
    setSelectedLoan(null);
    fetchLoans();
    fetchLoanStats();
    toast.success("Loan updated successfully");
  };

  const getLoanStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      approved: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      disbursed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      overdue: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      completed: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
      rejected: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
    };
    return colors[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
  };

  const getBorrowerTypeLabel = (borrowerModel) => {
    return borrowerModel === "User" ? "Individual" : "Group";
  };

  const getRiskLevelColor = (riskLevel) => {
    const colors = {
      low: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      high: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };
    return colors[riskLevel] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
  };

  if (loading && loans.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loan Management"
        description="Manage loan applications, approvals, and portfolio health"
        action={
          <Button onClick={handleCreateLoan}>
            <Plus className="h-4 w-4 mr-2" />
            New Loan Application
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loanStats.totalLoans}</div>
            <p className="text-xs text-muted-foreground">
              All loan applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialService.formatCurrency(loanStats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">Total loan value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loanStats.disbursedLoans}</div>
            <p className="text-xs text-muted-foreground">Currently disbursed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Health
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loanStats.portfolioHealth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Health Alert */}
      {loanStats.overdueLoans > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-medium">
                {loanStats.overdueLoans} loan(s) are overdue. Review and take
                action.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <FacebookCard>
        <FacebookCardHeader>
          <CardTitle>Filters</CardTitle>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="disbursed">Disbursed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Borrower Type</label>
              <Select
                value={filterBorrowerType}
                onValueChange={setFilterBorrowerType}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="User">Individual</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterBorrowerType("all");
                  fetchLoans();
                }}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Loans Table */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Loan Applications</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLoans()}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell className="font-medium">
                      {loan._id.toString().substring(0, 8)}
                    </TableCell>
                    <TableCell>{loan.borrower?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {loan.borrowerModel === "User" ? (
                          <User className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Building2 className="h-4 w-4 text-green-500" />
                        )}
                        {getBorrowerTypeLabel(loan.borrowerModel)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {financialService.formatCurrency(loan.amountRequested)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getLoanStatusColor(loan.status)}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {loan.riskAssessment ? (
                        <Badge
                          className={getRiskLevelColor(
                            loan.riskAssessment.riskLevel
                          )}
                        >
                          {loan.riskAssessment.riskLevel}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Not assessed
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {financialService.formatDate(loan.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewLoanDetails(loan)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditLoan(loan)}
                          >
                            Edit Application
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Repayment Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Download Statement
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {loans.length === 0 && !loading && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No loans found</p>
            </div>
          )}
        </FacebookCardContent>
      </FacebookCard>

      {/* Create Loan Dialog */}
      <Dialog open={isNewLoanOpen} onOpenChange={setIsNewLoanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Loan Application</DialogTitle>
          </DialogHeader>
          <LoanForm onSuccess={handleLoanSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit Loan Dialog */}
      <Dialog open={isEditLoanOpen} onOpenChange={setIsEditLoanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Loan Application</DialogTitle>
          </DialogHeader>
          <LoanForm loan={selectedLoan} onSuccess={handleLoanSuccess} />
        </DialogContent>
      </Dialog>

      {/* Loan Details Dialog */}
      <Dialog open={showLoanDetails} onOpenChange={setShowLoanDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
          </DialogHeader>
          {selectedLoan && <LoanDetails loan={selectedLoan} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Component to show detailed loan information
const LoanDetails = ({ loan }) => {
  const [repaymentSchedule, setRepaymentSchedule] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loan) {
      fetchLoanDetails();
    }
  }, [loan]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      // Fetch repayment schedule and transactions
      // This would need to be implemented in the backend
      setRepaymentSchedule(loan.repaymentSchedule || []);
      setTransactions([]); // Would fetch from transactions service
    } catch (error) {
      console.error("Error fetching loan details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Application ID:
              </span>
              <span className="font-medium">
                {loan._id.toString().substring(0, 8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Borrower:</span>
              <span className="font-medium">{loan.borrower?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Amount Requested:
              </span>
              <span className="font-medium">
                {financialService.formatCurrency(loan.amountRequested)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Amount Approved:
              </span>
              <span className="font-medium">
                {loan.amountApproved
                  ? financialService.formatCurrency(loan.amountApproved)
                  : "Not approved"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Interest Rate:
              </span>
              <span className="font-medium">{loan.interestRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Loan Term:</span>
              <span className="font-medium">{loan.loanTerm} months</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge className={getLoanStatusColor(loan.status)}>
                {loan.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Risk Level:</span>
              {loan.riskAssessment ? (
                <Badge
                  className={getRiskLevelColor(loan.riskAssessment.riskLevel)}
                >
                  {loan.riskAssessment.riskLevel}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Not assessed</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created:</span>
              <span className="font-medium">
                {financialService.formatDate(loan.createdAt)}
              </span>
            </div>
            {loan.approvedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Approved:</span>
                <span className="font-medium">
                  {financialService.formatDate(loan.approvedAt)}
                </span>
              </div>
            )}
            {loan.disbursedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Disbursed:
                </span>
                <span className="font-medium">
                  {financialService.formatDate(loan.disbursedAt)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Repayment Schedule */}
      {repaymentSchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Repayment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repaymentSchedule.map((installment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {financialService.formatDate(installment.dueDate)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {financialService.formatCurrency(installment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(installment.status)}>
                          {installment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {installment.paidAt
                          ? financialService.formatDate(installment.paidAt)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper functions
const getLoanStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    approved: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    disbursed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    overdue: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    completed: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    rejected: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
  };
  return colors[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
};

const getRiskLevelColor = (riskLevel) => {
  const colors = {
    low: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    high: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  };
  return colors[riskLevel] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
};

const getStatusColor = (status) => {
  const colors = {
    completed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    failed: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    cancelled: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
  };
  return colors[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
};

export default LoansPage;
