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
import { transactionService } from "../services/transactionService";
import TransactionForm from "../components/forms/TransactionForm";
import { formatCurrency, formatDate } from "../utils/formatters";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    pendingTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isCreateTransactionOpen, setIsCreateTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Fetch transactions
  useEffect(() => {
    fetchTransactions();
    fetchTransactionStats();
  }, []);

  // Filter transactions based on search term and type
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterType) params.type = filterType;
    fetchTransactions(params);
  }, [searchTerm, filterType]);

  const fetchTransactions = async (params = {}) => {
    try {
      setLoading(true);
      const response = await transactionService.getAll(params);
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const response = await transactionService.getStats();
      const stats = response.data?.data;
      if (stats && typeof stats === "object") {
        setTransactionStats({
          totalTransactions: stats.totalTransactions ?? 0,
          totalAmount: stats.totalAmount ?? 0,
          pendingTransactions: stats.pendingTransactions ?? 0,
        });
      }
    } catch (error) {
      console.error("Error fetching transaction stats:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const handleCreateTransaction = async (formData) => {
    try {
      await transactionService.create(formData);
      toast.success("Transaction created successfully");
      setIsCreateTransactionOpen(false);
      fetchTransactions();
      fetchTransactionStats();
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to create transaction");
    }
  };

  const handleUpdateTransaction = async (formData) => {
    try {
      await transactionService.update(currentTransaction._id, formData);
      toast.success("Transaction updated successfully");
      setIsEditTransactionOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionService.remove(id);
        toast.success("Transaction deleted successfully");
        fetchTransactions();
        fetchTransactionStats();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction");
      }
    }
  };

  // Get badge variant based on transaction status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage financial transactions and records
          </p>
        </div>
        <Button onClick={() => setIsCreateTransactionOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
              All financial transactions
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
              {formatCurrency(transactionStats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative transaction amount
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Transactions
            </CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionStats.pendingTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Transactions awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
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
              <SelectItem value="transfer_in">Transfer In</SelectItem>
              <SelectItem value="transfer_out">Transfer Out</SelectItem>
              <SelectItem value="fee_paid">Fee Payment</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Transactions
          </CardTitle>
          <CardDescription>
            View and manage all financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Transactions Found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType
                  ? "No transactions match your search criteria."
                  : "Start by creating a new transaction."}
              </p>
              <Button onClick={() => setIsCreateTransactionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Transaction
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="font-medium">
                      {transaction.type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(transaction.status)}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentTransaction(transaction);
                              setIsEditTransactionOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteTransaction(transaction._id)
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog
        open={isCreateTransactionOpen}
        onOpenChange={setIsCreateTransactionOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm onSubmit={handleCreateTransaction} />
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog
        open={isEditTransactionOpen}
        onOpenChange={setIsEditTransactionOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleUpdateTransaction}
            initialData={currentTransaction}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPage;
