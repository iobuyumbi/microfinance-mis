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
      active: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      inactive: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
      suspended: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
    };
    return colors[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
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
        <StatsCard
          title="Total Accounts"
          value={savingsStats.totalAccounts.toString()}
          icon={PiggyBank}
        />

        <StatsCard
          title="Total Savings"
          value={financialService.formatCurrency(savingsStats.totalSavings)}
          icon={DollarSign}
        />

        <StatsCard
          title="Active Accounts"
          value={savingsStats.activeAccounts.toString()}
          icon={CheckCircle}
        />

        <StatsCard
          title="Average Balance"
          value={financialService.formatCurrency(savingsStats.averageBalance)}
          icon={TrendingUp}
        />
      </div>

      {/* Filters */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
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

      {/* Savings Accounts */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Accounts</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSavingsAccounts()}
              disabled={loading}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
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
              <TableHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <TableRow>
                  <TableHead className="text-blue-50">Account Number</TableHead>
                  <TableHead className="text-blue-50">Owner</TableHead>
                  <TableHead className="text-blue-50">Type</TableHead>
                  <TableHead className="text-blue-50">Balance</TableHead>
                  <TableHead className="text-blue-50">Status</TableHead>
                  <TableHead className="text-blue-50">Created</TableHead>
                  <TableHead className="text-blue-50 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savingsAccounts.map((account) => (
                  <TableRow key={account._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20">
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
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
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
    savings_contribution: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    savings_withdrawal: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    loan_disbursement: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    loan_repayment: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    interest_earned: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    interest_charged: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    penalty_incurred: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    penalty_paid: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    fee_incurred: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    fee_paid: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    transfer_in: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    transfer_out: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    refund: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    adjustment: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
  };
  return colors[type] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
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

export default SavingsPage;
