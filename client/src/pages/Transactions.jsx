// src/pages/Transactions.jsx
import React, { useState, useEffect, useCallback } from "react";
import { transactionService } from "@/services/transactionService";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Textarea,
  AlertDialog, // Import AlertDialog for delete confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge, // Import Badge for status/category display
} from "@/components/ui"; // Correct path for Shadcn UI components
import {
  PageLayout,
  PageSection,
  StatsGrid,
  FiltersSection,
  ContentCard,
} from "@/components/layouts/PageLayout";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Import Lucide React Icons
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  DollarSign,
  CheckCircle,
  Hourglass,
  XCircle,
  Calendar,
  Tag,
  Hash,
  User,
  Info,
  Loader2,
} from "lucide-react";

// Custom Components (assuming these are available)
import { StatsCard } from "@/components/custom/StatsCard"; // Assuming StatsCard is available

export default function Transactions() {
  const {
    user: currentUser,
    groups,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const isStaff =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "officer");

  const [selectedGroup, setSelectedGroup] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    member: "", // This should ideally be a member ID, not just a string name
    amount: "",
    category: "Deposit",
    status: "Pending",
    reference: "",
    description: "",
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false); // For form submission loading state
  const [deletingId, setDeletingId] = useState(null); // State for delete button loading
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for delete confirmation dialog

  // Memoize fetchTransactions to prevent unnecessary re-renders and re-fetches
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let params = {};
      if (!isStaff && isAuthenticated && groups.length > 0) {
        params.group = groups.map((g) => g._id || g.id);
      } else if (isStaff && selectedGroup) {
        params.group = selectedGroup;
      } else if (isStaff && groups.length > 0 && !selectedGroup) {
        // Staff, no group selected, but groups exist: default to first group
        setSelectedGroup(groups[0]._id || groups[0].id);
        params.group = groups[0]._id || groups[0].id;
      }

      const data = await transactionService.getAll(params);
      setTransactions(
        Array.isArray(data)
          ? data
          : data.data && Array.isArray(data.data)
            ? data.data
            : []
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to load transactions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isStaff, groups, selectedGroup, isAuthenticated]);

  // Initial fetch on component mount and when auth status changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchTransactions();
      } else {
        setLoading(false);
        setError("You must be logged in to view transactions.");
      }
    }
  }, [isAuthenticated, authLoading, fetchTransactions]);

  // Set initial selected group for staff if groups are loaded
  useEffect(() => {
    if (isStaff && groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, isStaff, selectedGroup]);

  // Re-fetch transactions when selectedGroup changes for staff
  useEffect(() => {
    if (isStaff && selectedGroup) {
      fetchTransactions();
    }
  }, [selectedGroup, isStaff, fetchTransactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTransaction) {
        await transactionService.update(
          editingTransaction._id || editingTransaction.id,
          formData
        );
        toast.success("Transaction updated successfully.");
      } else {
        await transactionService.create(formData);
        toast.success("Transaction created successfully.");
      }
      setShowForm(false);
      setEditingTransaction(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "",
        member: "",
        amount: "",
        category: "Deposit",
        status: "Pending",
        reference: "",
        description: "",
      });
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      ...transaction,
      amount: transaction.amount.toString(),
      date: transaction.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0], // Ensure date is formatted for input
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false); // Close dialog first
    if (!deletingId) return;
    try {
      await transactionService.remove(deletingId);
      toast.success("Transaction deleted successfully.");
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || "Failed to delete transaction.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update for better UX
    const originalTransactions = [...transactions];
    setTransactions((prev) =>
      prev.map((t) =>
        t._id === id || t.id === id ? { ...t, status: newStatus } : t
      )
    );

    try {
      const transaction = originalTransactions.find(
        (t) => t.id === id || t._id === id
      );
      if (!transaction) throw new Error("Transaction not found.");
      await transactionService.update(id, {
        ...transaction,
        status: newStatus,
      });
      toast.success("Transaction status updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
      setTransactions(originalTransactions); // Revert on error
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesStatus =
      filterStatus === "All" || transaction.status === filterStatus;
    const matchesCategory =
      filterCategory === "All" || transaction.category === filterCategory;
    const matchesSearch =
      transaction.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description &&
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const totalTransactionsCount = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );
  const completedAmount = filteredTransactions
    .filter((t) => t.status === "Completed")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const pendingAmount = filteredTransactions
    .filter((t) => t.status === "Pending")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Render loading and error states based on authentication and authorization
  if (authLoading) {
    return (
      <PageLayout title="Transaction Management">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication and permissions...
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Transaction Management">
        <div className="p-6 text-center text-red-500">
          Access Denied: Please log in to view transactions.
        </div>
      </PageLayout>
    );
  }

  // Once authenticated, proceed with data loading or error display for transactions
  if (loading && transactions.length === 0) {
    return (
      <PageLayout title="Transaction Management">
        <div className="p-6 text-center text-muted-foreground">
          Loading transactions...
        </div>
      </PageLayout>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <PageLayout title="Transaction Management">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Transaction Management"
      action={
        <Button onClick={() => setShowForm(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      }
      headerContent={
        isStaff &&
        groups.length > 0 && (
          <div className="w-full md:w-64">
            <Label htmlFor="group" className="mb-2 block">
              Group
            </Label>
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
              id="group"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g._id || g.id} value={g._id || g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }
    >
      {/* Statistics Section */}
      <PageSection title="Overview">
        <StatsGrid cols={4}>
          <StatsCard
            title="Total Transactions"
            value={totalTransactionsCount}
            description="All recorded transactions"
            icon={Tag}
            trend={{ value: 10, isPositive: true }} // Example trend
          />
          <StatsCard
            title="Total Amount"
            value={`$${totalAmount.toLocaleString()}`}
            description="Sum of all transactions"
            icon={DollarSign}
            className="border-blue-200 bg-blue-50/50"
            trend={{ value: 5000, isPositive: true, isCurrency: true }} // Example trend
          />
          <StatsCard
            title="Completed Amount"
            value={`$${completedAmount.toLocaleString()}`}
            description="Successfully processed"
            icon={CheckCircle}
            className="border-green-200 bg-green-50/50"
            trend={{ value: 3000, isPositive: true, isCurrency: true }} // Example trend
          />
          <StatsCard
            title="Pending Amount"
            value={`$${pendingAmount.toLocaleString()}`}
            description="Awaiting completion"
            icon={Hourglass}
            className="border-yellow-200 bg-yellow-50/50"
            trend={{ value: -500, isPositive: false, isCurrency: true }} // Example trend
          />
        </StatsGrid>
      </PageSection>

      {/* Filters Section */}
      <PageSection title="Filters">
        <FiltersSection>
          <div className="flex-1">
            <Label htmlFor="search-term" className="mb-2 flex items-center">
              <Search className="h-4 w-4 mr-1" /> Search
            </Label>
            <Input
              id="search-term"
              type="text"
              placeholder="Search by member, type, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="filter-status" className="mb-2 flex items-center">
              <Filter className="h-4 w-4 mr-1" /> Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filter-status">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="filter-category" className="mb-2 flex items-center">
              <Tag className="h-4 w-4 mr-1" /> Category
            </Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Deposit">Deposit</SelectItem>
                <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                <SelectItem value="Repayment">Repayment</SelectItem>
                <SelectItem value="Disbursement">Disbursement</SelectItem>
                <SelectItem value="Fee">Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("All");
                setFilterCategory("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </FiltersSection>
      </PageSection>

      {/* Transactions Table Section */}
      <PageSection title="Transactions">
        <ContentCard isLoading={loading}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton rows for loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 bg-muted rounded w-1/2 ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No transactions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id || transaction._id}>
                    <TableCell className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium flex items-center">
                      <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                      {transaction.reference}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {transaction.type}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {transaction.member}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize ${
                          transaction.category === "Deposit"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : transaction.category === "Withdrawal"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : transaction.category === "Repayment"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : transaction.category === "Disbursement"
                                  ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {Number(transaction.amount)?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={transaction.status}
                        onValueChange={(value) =>
                          handleStatusChange(
                            transaction.id || transaction._id,
                            value
                          )
                        }
                        disabled={!isStaff} // Only staff can change status
                      >
                        <SelectTrigger
                          className={`h-8 text-xs font-semibold rounded-full border-0 capitalize ${
                            transaction.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                        className="p-0 h-auto mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            disabled={
                              deletingId === (transaction.id || transaction._id)
                            }
                          >
                            {deletingId ===
                            (transaction.id || transaction._id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the transaction with reference
                              <span className="font-semibold">
                                {" "}
                                {transaction.reference}
                              </span>
                              .
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => confirmDelete()}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ContentCard>
      </PageSection>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "New Transaction"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="col-span-3"
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Transaction Type
                </Label>
                <Input
                  id="type"
                  type="text"
                  required
                  placeholder="e.g., Loan Payment, Savings Deposit"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="col-span-3"
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member" className="text-right">
                  Member
                </Label>
                <Input
                  id="member"
                  type="text"
                  required
                  value={formData.member}
                  onChange={(e) =>
                    setFormData({ ...formData, member: e.target.value })
                  }
                  className="col-span-3"
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount ($)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="col-span-3"
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  disabled={submitting}
                >
                  <SelectTrigger id="category" className="col-span-3">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="Repayment">Repayment</SelectItem>
                    <SelectItem value="Disbursement">Disbursement</SelectItem>
                    <SelectItem value="Fee">Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={submitting || !isStaff} // Only staff can change status in form
                >
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">
                  Reference
                </Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  className="col-span-3"
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                  rows="3"
                  disabled={submitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                  setFormData({
                    date: new Date().toISOString().split("T")[0],
                    type: "",
                    member: "",
                    amount: "",
                    category: "Deposit",
                    status: "Pending",
                    reference: "",
                    description: "",
                  });
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingTransaction ? "Update" : "Create"} Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
