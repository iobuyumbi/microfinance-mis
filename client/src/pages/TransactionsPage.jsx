import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  CreditCard,
  Plus,
  Search,
  Loader2,
  DollarSign,
  ArrowUpDown,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import TransactionForm from "../components/forms/TransactionForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    pendingTransactions: 0,
    monthlyContributions: 0,
    monthlyRepayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isCreateTransactionOpen, setIsCreateTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const { user } = useAuth();

  // Fetch transactions
  useEffect(() => {
    fetchTransactions();
    fetchTransactionStats();
  }, []);

  // Filter transactions based on search term, type, and date range
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterType && filterType !== 'all') params.type = filterType;
    if (dateRange.start) params.startDate = dateRange.start;
    if (dateRange.end) params.endDate = dateRange.end;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    fetchTransactions(params);
  }, [searchTerm, filterType, dateRange, sortBy, sortOrder]);

  const fetchTransactions = async (params = {}) => {
    try {
      setLoading(true);
      const response = await financialService.getTransactions(params);
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const [statsResponse, dashboardResponse] = await Promise.all([
        financialService.getTransactions({ limit: 1 }), // Get count
        financialService.getDashboardStats(),
      ]);

      const totalTransactions = statsResponse.data?.count || 0;
      const dashboardData = dashboardResponse.data?.data || {};

      setTransactionStats({
        totalTransactions,
        totalAmount: dashboardData.totalSavings || 0,
        pendingTransactions: transactions.filter((t) => t.status === "pending")
          .length,
        monthlyContributions: dashboardData.monthlyContributions || 0,
        monthlyRepayments: dashboardData.monthlyRepayments || 0,
      });
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
    }
  };

  const handleCreateTransaction = () => {
    setIsCreateTransactionOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setIsEditTransactionOpen(true);
  };

  const handleTransactionSuccess = () => {
    setIsCreateTransactionOpen(false);
    setIsEditTransactionOpen(false);
    setCurrentTransaction(null);
    fetchTransactions();
    fetchTransactionStats();
    toast.success("Transaction updated successfully");
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

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

  if (loading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and track all financial transactions
          </p>
        </div>
        <Button onClick={handleCreateTransaction}>
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionStats.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialService.formatCurrency(transactionStats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total transaction value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Contributions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialService.formatCurrency(
                transactionStats.monthlyContributions
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Repayments
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialService.formatCurrency(
                transactionStats.monthlyRepayments
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's repayments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="savings_contribution">
                    Savings Contribution
                  </SelectItem>
                  <SelectItem value="savings_withdrawal">
                    Savings Withdrawal
                  </SelectItem>
                  <SelectItem value="loan_disbursement">
                    Loan Disbursement
                  </SelectItem>
                  <SelectItem value="loan_repayment">Loan Repayment</SelectItem>
                  <SelectItem value="interest_earned">
                    Interest Earned
                  </SelectItem>
                  <SelectItem value="interest_charged">
                    Interest Charged
                  </SelectItem>
                  <SelectItem value="penalty_incurred">
                    Penalty Incurred
                  </SelectItem>
                  <SelectItem value="penalty_paid">Penalty Paid</SelectItem>
                  <SelectItem value="fee_incurred">Fee Incurred</SelectItem>
                  <SelectItem value="fee_paid">Fee Paid</SelectItem>
                  <SelectItem value="transfer_in">Transfer In</SelectItem>
                  <SelectItem value="transfer_out">Transfer Out</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="col-span-4 mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setDateRange({ start: "", end: "" });
                  fetchTransactions();
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTransactions()}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                      className="h-auto p-0 font-semibold"
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Member/Group</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("amount")}
                      className="h-auto p-0 font-semibold"
                    >
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      {financialService.formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getTransactionTypeColor(transaction.type)}
                      >
                        {getTransactionTypeLabel(transaction.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      {transaction.member?.name ||
                        transaction.group?.name ||
                        "System"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {financialService.formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.receiptNumber ? (
                        <span className="text-sm text-muted-foreground">
                          {transaction.receiptNumber}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {transactions.length === 0 && !loading && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog
        open={isCreateTransactionOpen}
        onOpenChange={setIsCreateTransactionOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm onSuccess={handleTransactionSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog
        open={isEditTransactionOpen}
        onOpenChange={setIsEditTransactionOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={currentTransaction}
            onSuccess={handleTransactionSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPage;
