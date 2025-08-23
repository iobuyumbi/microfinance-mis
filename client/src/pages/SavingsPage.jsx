import React, { useState, useEffect } from "react";
import { StatsCard } from "../components/ui/stats-card";
import {
  FacebookCard,
  FacebookCardHeader,
  FacebookCardContent,
} from "../components/ui/facebook-card";
import { Button } from "../components/ui/button";
import {
  PiggyBank,
  Plus,
  Search,
  Loader2,
  DollarSign,
  Activity,
  MoreHorizontal,
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
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
import { toast } from "sonner";
import { financialService } from "../services/financialService";
import SavingsForm from "../components/forms/SavingsForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
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
import { handleApiError } from "../utils/errorHandler";
import { PageHeader } from "../components/custom/PageHeader";
import TransactionForm from "../components/forms/TransactionForm";

const SavingsPage = () => {
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [savingsStats, setSavingsStats] = useState({
    totalAccounts: 0,
    totalSavings: 0,
    activeAccounts: 0,
    monthlyContributions: 0,
    monthlyWithdrawals: 0,
    averageBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOwner, setFilterOwner] = useState("all");
  const [isCreateSavingsOpen, setIsCreateSavingsOpen] = useState(false);
  const [isEditSavingsOpen, setIsEditSavingsOpen] = useState(false);
  const [currentSavings, setCurrentSavings] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const { user } = useAuth();

  // Fetch savings accounts
  useEffect(() => {
    fetchSavingsAccounts();
    fetchSavingsStats();
  }, []);

  // Filter savings based on search term and owner type
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterOwner && filterOwner !== 'all') params.ownerModel = filterOwner;
    fetchSavingsAccounts(params);
  }, [searchTerm, filterOwner]);

  const fetchSavingsAccounts = async (params = {}) => {
    try {
      setLoading(true);
      const query = { type: "savings", ...params };
      const response = await financialService.getAccounts(query);
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setSavingsAccounts(data);
    } catch (error) {
      // Use our improved error handling utility
      handleApiError(error, 'savings', {
        showToast: true,
        logError: true,
        rethrow: false
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavingsStats = async () => {
    try {
      const [dashboardResponse, accountsResponse] = await Promise.all([
        financialService.getDashboardStats(),
        financialService.getAccounts({ type: "savings" }),
      ]);

      const dashboardData = dashboardResponse.data?.data || {};
      const accounts = accountsResponse.data?.data || [];

      const activeAccounts = accounts.filter(
        (account) => account.status === "active"
      ).length;
      const totalBalance = accounts.reduce(
        (sum, account) => sum + (account.balance || 0),
        0
      );
      const averageBalance =
        activeAccounts > 0 ? totalBalance / activeAccounts : 0;

      setSavingsStats({
        totalAccounts: accounts.length,
        totalSavings: dashboardData.totalSavings || 0,
        activeAccounts,
        monthlyContributions: dashboardData.monthlyContributions || 0,
        monthlyWithdrawals: 0, // This would need to be calculated from transactions
        averageBalance,
      });
    } catch (error) {
      // Use our improved error handling utility
      handleApiError(error, 'savings', {
        showToast: true,
        logError: true,
        rethrow: false
      });
    }
  };

  const handleCreateSavings = () => {
    setIsCreateSavingsOpen(true);
  };

  const handleEditSavings = (account) => {
    setCurrentSavings(account);
    setIsEditSavingsOpen(true);
  };

  const handleViewTransactions = (account) => {
    setSelectedAccount(account);
    setShowTransactions(true);
  };

  const handleSavingsSuccess = () => {
    setIsCreateSavingsOpen(false);
    setIsEditSavingsOpen(false);
    setCurrentSavings(null);
    fetchSavingsAccounts();
    fetchSavingsStats();
    toast.success("Savings account updated successfully");
  };

  const getAccountStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getOwnerTypeLabel = (ownerModel) => {
    return ownerModel === "User" ? "Individual" : "Group";
  };

  if (loading && savingsAccounts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Accounts"
        description="Manage and track savings accounts for members and groups"
        action={
          <Button onClick={handleCreateSavings}>
            <Plus className="h-4 w-4 mr-2" />
            New Savings Account
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Accounts
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savingsStats.totalAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              All savings accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialService.formatCurrency(savingsStats.totalSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total balance across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Accounts
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savingsStats.activeAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Balance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialService.formatCurrency(savingsStats.averageBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per active account
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FacebookCard>
        <FacebookCardHeader>
          <CardTitle>Filters</CardTitle>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Owner Type</label>
              <Select value={filterOwner} onValueChange={setFilterOwner}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
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
                  setFilterOwner("all");
                  fetchSavingsAccounts();
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

      {/* Savings Accounts Table */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Savings Accounts</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSavingsAccounts()}
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
                  <TableHead>Account Number</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savingsAccounts.map((account) => (
                  <TableRow key={account._id}>
                    <TableCell className="font-medium">
                      {account.accountNumber}
                    </TableCell>
                    <TableCell>{account.owner?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {account.ownerModel === "User" ? (
                          <Users className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Building2 className="h-4 w-4 text-green-500" />
                        )}
                        {getOwnerTypeLabel(account.ownerModel)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {financialService.formatCurrency(account.balance)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getAccountStatusColor(account.status)}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {financialService.formatDate(account.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewTransactions(account)}
                          >
                            View Transactions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditSavings(account)}
                          >
                            Edit Account
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

          {savingsAccounts.length === 0 && !loading && (
            <div className="text-center py-8">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No savings accounts found</p>
            </div>
          )}
        </FacebookCardContent>
      </FacebookCard>

      {/* Create Savings Dialog */}
      <Dialog open={isCreateSavingsOpen} onOpenChange={setIsCreateSavingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Savings Account</DialogTitle>
          </DialogHeader>
          <SavingsForm onSuccess={handleSavingsSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit Savings Dialog */}
      <Dialog open={isEditSavingsOpen} onOpenChange={setIsEditSavingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Savings Account</DialogTitle>
          </DialogHeader>
          <SavingsForm
            account={currentSavings}
            onSuccess={handleSavingsSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Transactions Dialog */}
      <Dialog open={showTransactions} onOpenChange={setShowTransactions}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Transactions for {selectedAccount?.accountNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedAccount && <AccountTransactions account={selectedAccount} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Component to show account transactions
const AccountTransactions = ({ account }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      fetchTransactions();
    }
  }, [account]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await financialService.getSavingsTransactions(
        account._id
      );
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setTransactions(data);
    } catch (error) {
      // Use our improved error handling utility
      handleApiError(error, 'transactions', {
        showToast: true,
        logError: true,
        rethrow: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Owner: {account.owner?.name || "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">
            Current Balance: {financialService.formatCurrency(account.balance)}
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance After</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>
                  {financialService.formatDate(transaction.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge className={getTransactionTypeColor(transaction.type)}>
                    {getTransactionTypeLabel(transaction.type)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {transaction.description}
                </TableCell>
                <TableCell className="font-medium">
                  {financialService.formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  {financialService.formatCurrency(transaction.balanceAfter)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No transactions found for this account
          </p>
        </div>
      )}
    </div>
  );
};

// Helper functions (same as in TransactionsPage)
const getTransactionTypeLabel = (type) => {
  const labels = {
    savings_contribution: "Savings Contribution",
    savings_withdrawal: "Savings Withdrawal",
    loan_disbursement: "Loan Disbursement",
    loan_repayment: "Loan Repayment",
    interest_earned: "Interest Earned",
    interest_charged: "Interest Charged",
    penalty_incurred: "Penalty Incurred",
    penalty_paid: "Penalty Paid",
    fee_incurred: "Fee Incurred",
    fee_paid: "Fee Paid",
    transfer_in: "Transfer In",
    transfer_out: "Transfer Out",
    refund: "Refund",
    adjustment: "Adjustment",
  };
  return labels[type] || type;
};

const getTransactionTypeColor = (type) => {
  const colors = {
    savings_contribution: "bg-green-100 text-green-800",
    savings_withdrawal: "bg-red-100 text-red-800",
    loan_disbursement: "bg-blue-100 text-blue-800",
    loan_repayment: "bg-green-100 text-green-800",
    interest_earned: "bg-purple-100 text-purple-800",
    interest_charged: "bg-orange-100 text-orange-800",
    penalty_incurred: "bg-red-100 text-red-800",
    penalty_paid: "bg-green-100 text-green-800",
    fee_incurred: "bg-red-100 text-red-800",
    fee_paid: "bg-green-100 text-green-800",
    transfer_in: "bg-blue-100 text-blue-800",
    transfer_out: "bg-orange-100 text-orange-800",
    refund: "bg-green-100 text-green-800",
    adjustment: "bg-gray-100 text-gray-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

const getStatusColor = (status) => {
  const colors = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default SavingsPage;
