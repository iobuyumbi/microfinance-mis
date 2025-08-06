import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
  Upload,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const TransactionsPage = () => {
  const {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loading,
  } = useApi();
  const { user: currentUser, hasRole } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: "deposit",
    amount: "",
    description: "",
    category: "",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, typeFilter, statusFilter, dateFilter]);

  const loadTransactions = async () => {
    try {
      const result = await getTransactions();
      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.reference
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        switch (dateFilter) {
          case "today":
            return transactionDate >= today;
          case "yesterday":
            return transactionDate >= yesterday && transactionDate < today;
          case "lastWeek":
            return transactionDate >= lastWeek;
          case "lastMonth":
            return transactionDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleCreateTransaction = async () => {
    try {
      const result = await createTransaction(formData);
      if (result.success) {
        toast.success("Transaction created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        loadTransactions();
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  };

  const handleUpdateTransaction = async () => {
    try {
      const result = await updateTransaction(selectedTransaction._id, formData);
      if (result.success) {
        toast.success("Transaction updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        loadTransactions();
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        const result = await deleteTransaction(transactionId);
        if (result.success) {
          toast.success("Transaction deleted successfully");
          loadTransactions();
        }
      } catch (error) {
        console.error("Failed to delete transaction:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: "deposit",
      amount: "",
      description: "",
      category: "",
      reference: "",
      notes: "",
    });
    setSelectedTransaction(null);
  };

  const openEditDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || "",
      category: transaction.category || "",
      reference: transaction.reference || "",
      notes: transaction.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const getTypeBadge = (type) => {
    const variants = {
      deposit: "default",
      withdrawal: "secondary",
      transfer: "outline",
      loan_payment: "destructive",
      loan_disbursement: "default",
      fee: "secondary",
    };

    const icons = {
      deposit: ArrowUpRight,
      withdrawal: ArrowDownRight,
      transfer: TrendingUp,
      loan_payment: CreditCard,
      loan_disbursement: DollarSign,
      fee: FileText,
    };

    const Icon = icons[type] || FileText;

    return (
      <Badge variant={variants[type] || "default"}>
        <Icon className="h-3 w-3 mr-1" />
        {type.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const calculateTotals = () => {
    const totals = filteredTransactions.reduce(
      (acc, transaction) => {
        if (
          transaction.type === "deposit" ||
          transaction.type === "loan_disbursement"
        ) {
          acc.income += transaction.amount || 0;
        } else {
          acc.expense += transaction.amount || 0;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    totals.balance = totals.income - totals.expense;
    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Transaction Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all financial transactions
          </p>
        </div>
        {hasRole(["admin", "officer"]) && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Transaction</DialogTitle>
                <DialogDescription>
                  Record a new financial transaction in the system.
                </DialogDescription>
              </DialogHeader>
              <TransactionForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateTransaction}
                loading={loading}
                isEdit={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${totals.income.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ${totals.expense.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p
                  className={`text-2xl font-bold ${totals.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${totals.balance.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="loan_payment">Loan Payment</SelectItem>
                <SelectItem value="loan_disbursement">
                  Loan Disbursement
                </SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="lastWeek">Last 7 Days</SelectItem>
                <SelectItem value="lastMonth">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          <CardDescription>
            Manage and track all financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">
                        {transaction.description || "Transaction"}
                      </h3>
                      {getTypeBadge(transaction.type)}
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {transaction.user?.name || "Unknown"}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                      {transaction.reference && (
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {transaction.reference}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p
                      className={`font-bold ${transaction.type === "deposit" || transaction.type === "loan_disbursement" ? "text-green-600" : "text-red-600"}`}
                    >
                      ${transaction.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.category || "Uncategorized"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => openViewDialog(transaction)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {hasRole(["admin", "officer"]) && (
                        <>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(transaction)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteTransaction(transaction._id)
                            }
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
            <DialogDescription>
              Record a new financial transaction in the system.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateTransaction}
            loading={loading}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction information.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateTransaction}
            loading={loading}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about the transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionDetails transaction={selectedTransaction} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TransactionForm = ({
  formData,
  setFormData,
  onSubmit,
  loading,
  isEdit,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Transaction Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="loan_payment">Loan Payment</SelectItem>
              <SelectItem value="loan_disbursement">
                Loan Disbursement
              </SelectItem>
              <SelectItem value="fee">Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            required
            min="0.01"
            step="0.01"
            placeholder="Enter amount"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="fee">Fee</SelectItem>
              <SelectItem value="contribution">Contribution</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="reference">Reference</Label>
          <Input
            id="reference"
            name="reference"
            value={formData.reference}
            onChange={handleInputChange}
            placeholder="Transaction reference"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          placeholder="Transaction description"
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          placeholder="Additional notes..."
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEdit
              ? "Update Transaction"
              : "Create Transaction"}
        </Button>
      </div>
    </form>
  );
};

const TransactionDetails = ({ transaction }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Transaction ID
              </Label>
              <p className="text-lg font-medium">{transaction._id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Type</Label>
              <p className="text-lg font-medium capitalize">
                {transaction.type.replace("_", " ")}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Amount
              </Label>
              <p className="text-lg font-medium">
                ${transaction.amount?.toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Status
              </Label>
              <p className="text-lg font-medium capitalize">
                {transaction.status}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Category
              </Label>
              <p className="text-lg font-medium capitalize">
                {transaction.category || "Uncategorized"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Date</Label>
              <p className="text-lg font-medium">
                {new Date(transaction.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {transaction.description && (
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Description
              </Label>
              <p className="text-sm">{transaction.description}</p>
            </div>
          )}

          {transaction.reference && (
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Reference
              </Label>
              <p className="text-sm">{transaction.reference}</p>
            </div>
          )}

          {transaction.notes && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Notes</Label>
              <p className="text-sm">{transaction.notes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Transaction history will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionsPage;
