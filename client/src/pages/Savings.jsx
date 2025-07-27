import React, { useState, useEffect, useCallback } from "react";
import { savingsService } from "@/services/savingsService";
import { useAuth } from "@/context/AuthContext";

// Shadcn UI Components
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog, // Import AlertDialog for delete confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge, // Import Badge for status display
} from "@/components/ui";
import {
  PageLayout,
  PageSection,
  StatsGrid,
  FiltersSection,
  ContentCard,
} from "@/components/layouts/PageLayout";
import { toast } from "sonner";

// Import Lucide React Icons
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  PiggyBank, // For savings account
  User, // For account holder
  Hash, // For account number
  Tag, // For account type
  Activity, // For status
  Loader2, // For loading spinners
  TrendingUp, // For stats card
  CheckCircle, // Added CheckCircle for import
  ArrowRight, // For deposit/withdrawal
  Wallet, // For total balance
  Banknote, // For interest earned
} from "lucide-react";

// Custom Components (assuming StatsCard is available)
import { StatsCard } from "@/components/custom/StatsCard";

export default function Savings() {
  const {
    user: currentUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const isStaff =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "officer");

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    balance: "",
    accountType: "savings",
    status: "Active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await savingsService.getAll();
      setAccounts(
        Array.isArray(data)
          ? data
          : data.data && Array.isArray(data.data)
            ? data.data
            : []
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to load savings accounts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchAccounts();
      } else {
        setLoading(false);
        setError("You must be logged in to view savings accounts.");
      }
    }
  }, [isAuthenticated, authLoading, fetchAccounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        balance: parseFloat(formData.balance),
      };

      if (editingAccount) {
        await savingsService.update(
          editingAccount._id || editingAccount.id,
          payload
        );
        toast.success("Savings account updated successfully.");
      } else {
        await savingsService.create(payload);
        toast.success("Savings account created successfully.");
      }
      setShowForm(false);
      setEditingAccount(null);
      setFormData({
        accountHolder: "",
        accountNumber: "",
        balance: "",
        accountType: "savings",
        status: "Active",
      });
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      accountHolder: account.accountHolder,
      accountNumber: account.accountNumber,
      balance: account.balance.toString(),
      accountType: account.accountType,
      status: account.status,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingAccountId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    if (!deletingAccountId) return;
    try {
      await savingsService.remove(deletingAccountId);
      toast.success("Savings account deleted successfully.");
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || "Failed to delete savings account.");
    } finally {
      setDeletingAccountId(null);
    }
  };

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.status === "Active").length;
  const totalBalance = accounts.reduce(
    (sum, a) => sum + Number(a.balance || 0),
    0
  );
  const averageBalance =
    accounts.length > 0 ? totalBalance / accounts.length : 0;

  if (authLoading) {
    return (
      <PageLayout title="Savings Management">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication and permissions...
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Savings Management">
        <div className="p-6 text-center text-red-500">
          <PiggyBank className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: Please log in to view savings accounts.
        </div>
      </PageLayout>
    );
  }

  if (loading && accounts.length === 0) {
    return (
      <PageLayout title="Savings Management">
        <div className="p-6 text-center text-muted-foreground">
          Loading savings accounts...
        </div>
      </PageLayout>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <PageLayout title="Savings Management">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Savings Management"
      action={
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingAccount(null);
            setFormData({
              accountHolder: "",
              accountNumber: "",
              balance: "",
              accountType: "savings",
              status: "Active",
            });
          }}
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Savings Account
        </Button>
      }
    >
      <PageSection title="Overview">
        <StatsGrid cols={4}>
          <StatsCard
            title="Total Accounts"
            value={totalAccounts}
            description="All registered savings accounts"
            icon={PiggyBank}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Active Accounts"
            value={activeAccounts}
            description="Currently active savings accounts"
            icon={CheckCircle}
            className="border-green-200 bg-green-50/50"
            trend={{ value: 3, isPositive: true }}
          />
          <StatsCard
            title="Total Balance"
            value={`$${totalBalance.toLocaleString()}`}
            description="Sum across all savings accounts"
            icon={Wallet}
            className="border-blue-200 bg-blue-50/50"
            trend={{ value: 25000, isPositive: true, isCurrency: true }}
          />
          <StatsCard
            title="Average Balance"
            value={`$${averageBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            description="Average balance per account"
            icon={Banknote}
            className="border-purple-200 bg-purple-50/50"
            trend={{ value: 1000, isPositive: true, isCurrency: true }}
          />
        </StatsGrid>
      </PageSection>

      <PageSection title="All Savings Accounts">
        <ContentCard isLoading={loading}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center">
                  <User className="h-4 w-4 mr-2" /> Account Holder
                </TableHead>
                <TableHead className="flex items-center">
                  <Hash className="h-4 w-4 mr-2" /> Account #
                </TableHead>
                <TableHead className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" /> Balance
                </TableHead>
                <TableHead className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" /> Type
                </TableHead>
                <TableHead className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" /> Status
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 bg-muted rounded w-1/2 ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No savings accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account._id || account.id}>
                    <TableCell className="font-medium">
                      {account.accountHolder}
                    </TableCell>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>${account.balance?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {account.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize ${
                          account.status === "Active"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
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
                              deletingAccountId === (account.id || account._id)
                            }
                          >
                            {deletingAccountId ===
                            (account.id || account._id) ? (
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
                              permanently delete the savings account.
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

      {/* New/Edit Savings Account Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Savings Account" : "New Savings Account"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="accountHolder"
                className="text-right flex items-center"
              >
                <User className="h-4 w-4 mr-1" /> Account Holder
              </Label>
              <Input
                id="accountHolder"
                type="text"
                required
                value={formData.accountHolder}
                onChange={(e) =>
                  setFormData({ ...formData, accountHolder: e.target.value })
                }
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="accountNumber"
                className="text-right flex items-center"
              >
                <Hash className="h-4 w-4 mr-1" /> Account Number
              </Label>
              <Input
                id="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                placeholder="Auto-generated if empty"
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Balance ($)
              </Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                required
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: e.target.value })
                }
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="accountType"
                className="text-right flex items-center"
              >
                <Tag className="h-4 w-4 mr-1" /> Account Type
              </Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) =>
                  setFormData({ ...formData, accountType: value })
                }
                disabled={submitting}
              >
                <SelectTrigger id="accountType" className="col-span-3">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right flex items-center">
                <Activity className="h-4 w-4 mr-1" /> Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={submitting || !isStaff} // Only staff can change status in form
              >
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingAccount(null);
                  setFormData({
                    accountHolder: "",
                    accountNumber: "",
                    balance: "",
                    accountType: "savings",
                    status: "Active",
                  });
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {editingAccount ? "Update" : "Create"} Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete Account */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              savings account.
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
    </PageLayout>
  );
}
