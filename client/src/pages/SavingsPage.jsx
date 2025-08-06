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
import { Progress } from "@/components/ui/progress";
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
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  History,
  Settings,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SavingsPage = () => {
  const {
    getSavings,
    createSaving,
    updateSaving,
    deleteSaving,
    depositSavings,
    withdrawSavings,
    loading,
  } = useApi();
  const { user: currentUser, hasRole } = useAuth();
  const [savings, setSavings] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [formData, setFormData] = useState({
    accountType: "regular",
    targetAmount: "",
    monthlyGoal: "",
    notes: "",
  });
  const [transactionData, setTransactionData] = useState({
    amount: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    loadSavings();
  }, []);

  useEffect(() => {
    filterSavings();
  }, [savings, searchTerm, statusFilter]);

  const loadSavings = async () => {
    try {
      const result = await getSavings();
      if (result.success) {
        setSavings(result.data);
      }
    } catch (error) {
      console.error("Failed to load savings:", error);
    }
  };

  const filterSavings = () => {
    let filtered = savings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (saving) =>
          saving.accountNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          saving.owner?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          saving.accountType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (saving) => saving.isActive === (statusFilter === "active")
      );
    }

    setFilteredSavings(filtered);
  };

  const handleCreateSaving = async () => {
    try {
      const result = await createSaving(formData);
      if (result.success) {
        toast.success("Savings account created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        loadSavings();
      }
    } catch (error) {
      console.error("Failed to create savings account:", error);
    }
  };

  const handleUpdateSaving = async () => {
    try {
      const result = await updateSaving(selectedSaving._id, formData);
      if (result.success) {
        toast.success("Savings account updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        loadSavings();
      }
    } catch (error) {
      console.error("Failed to update savings account:", error);
    }
  };

  const handleDeposit = async () => {
    try {
      const result = await depositSavings(selectedSaving._id, transactionData);
      if (result.success) {
        toast.success("Deposit successful");
        setIsDepositDialogOpen(false);
        resetTransactionForm();
        loadSavings();
      }
    } catch (error) {
      console.error("Failed to deposit:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      const result = await withdrawSavings(selectedSaving._id, transactionData);
      if (result.success) {
        toast.success("Withdrawal successful");
        setIsWithdrawDialogOpen(false);
        resetTransactionForm();
        loadSavings();
      }
    } catch (error) {
      console.error("Failed to withdraw:", error);
    }
  };

  const handleDeleteSaving = async (savingId) => {
    if (
      window.confirm("Are you sure you want to delete this savings account?")
    ) {
      try {
        const result = await deleteSaving(savingId);
        if (result.success) {
          toast.success("Savings account deleted successfully");
          loadSavings();
        }
      } catch (error) {
        console.error("Failed to delete savings account:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      accountType: "regular",
      targetAmount: "",
      monthlyGoal: "",
      notes: "",
    });
    setSelectedSaving(null);
  };

  const resetTransactionForm = () => {
    setTransactionData({
      amount: "",
      description: "",
      notes: "",
    });
  };

  const openEditDialog = (saving) => {
    setSelectedSaving(saving);
    setFormData({
      accountType: saving.accountType || "regular",
      targetAmount: saving.targetAmount || "",
      monthlyGoal: saving.monthlyGoal || "",
      notes: saving.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDepositDialog = (saving) => {
    setSelectedSaving(saving);
    setIsDepositDialogOpen(true);
  };

  const openWithdrawDialog = (saving) => {
    setSelectedSaving(saving);
    setIsWithdrawDialogOpen(true);
  };

  const openViewDialog = (saving) => {
    setSelectedSaving(saving);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <TrendingUp className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        <TrendingDown className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const variants = {
      regular: "default",
      emergency: "destructive",
      goal: "secondary",
      retirement: "outline",
    };
    return (
      <Badge variant={variants[type] || "default"} className="capitalize">
        {type}
      </Badge>
    );
  };

  const calculateGoalProgress = (saving) => {
    if (!saving.targetAmount || !saving.balance) return 0;
    return Math.min(
      Math.round((saving.balance / saving.targetAmount) * 100),
      100
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Savings Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage savings accounts, deposits, and withdrawals
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
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Savings Account</DialogTitle>
                <DialogDescription>
                  Create a new savings account for a member.
                </DialogDescription>
              </DialogHeader>
              <SavingsForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateSaving}
                loading={loading}
                isEdit={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search savings accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Savings Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSavings.map((saving) => (
          <Card key={saving._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">
                    {saving.accountNumber || `SAV-${saving._id.slice(-6)}`}
                  </CardTitle>
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
                    <DropdownMenuItem onClick={() => openViewDialog(saving)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDepositDialog(saving)}>
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Deposit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openWithdrawDialog(saving)}
                    >
                      <ArrowDownRight className="mr-2 h-4 w-4" />
                      Withdraw
                    </DropdownMenuItem>
                    {hasRole(["admin", "officer"]) && (
                      <>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(saving)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteSaving(saving._id)}
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
              <div className="flex items-center space-x-2">
                {getStatusBadge(saving.isActive)}
                {getTypeBadge(saving.accountType)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Balance</span>
                  <span className="text-lg font-bold text-green-600">
                    ${saving.balance?.toLocaleString() || "0"}
                  </span>
                </div>

                {saving.targetAmount && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Goal Progress</span>
                      <span className="text-gray-600">
                        ${saving.balance?.toLocaleString() || "0"} / $
                        {saving.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={calculateGoalProgress(saving)}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 text-center">
                      {calculateGoalProgress(saving)}% of target reached
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <User className="h-3 w-3 mr-2" />
                  {saving.owner?.name || "Unknown"}
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-2" />
                  {new Date(saving.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openDepositDialog(saving)}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openWithdrawDialog(saving)}
                >
                  <ArrowDownRight className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSavings.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <PiggyBank className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No savings accounts found.</p>
          </div>
        )}
      </div>

      {/* Create Savings Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Savings Account</DialogTitle>
            <DialogDescription>
              Create a new savings account for a member.
            </DialogDescription>
          </DialogHeader>
          <SavingsForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateSaving}
            loading={loading}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Savings Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Savings Account</DialogTitle>
            <DialogDescription>
              Update savings account information and settings.
            </DialogDescription>
          </DialogHeader>
          <SavingsForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateSaving}
            loading={loading}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make Deposit</DialogTitle>
            <DialogDescription>
              Add money to the savings account.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            formData={transactionData}
            setFormData={setTransactionData}
            onSubmit={handleDeposit}
            loading={loading}
            type="deposit"
          />
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make Withdrawal</DialogTitle>
            <DialogDescription>
              Withdraw money from the savings account.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            formData={transactionData}
            setFormData={setTransactionData}
            onSubmit={handleWithdraw}
            loading={loading}
            type="withdraw"
          />
        </DialogContent>
      </Dialog>

      {/* View Savings Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Savings Account Details</DialogTitle>
            <DialogDescription>
              Complete information about the savings account.
            </DialogDescription>
          </DialogHeader>
          {selectedSaving && <SavingsDetails saving={selectedSaving} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SavingsForm = ({ formData, setFormData, onSubmit, loading, isEdit }) => {
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
          <Label htmlFor="accountType">Account Type *</Label>
          <Select
            value={formData.accountType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, accountType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular Savings</SelectItem>
              <SelectItem value="emergency">Emergency Fund</SelectItem>
              <SelectItem value="goal">Goal Savings</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="targetAmount">Target Amount</Label>
          <Input
            id="targetAmount"
            name="targetAmount"
            type="number"
            value={formData.targetAmount}
            onChange={handleInputChange}
            placeholder="Optional savings goal"
          />
        </div>
        <div>
          <Label htmlFor="monthlyGoal">Monthly Goal</Label>
          <Input
            id="monthlyGoal"
            name="monthlyGoal"
            type="number"
            value={formData.monthlyGoal}
            onChange={handleInputChange}
            placeholder="Monthly savings target"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          placeholder="Additional notes about this savings account..."
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Account" : "Create Account"}
        </Button>
      </div>
    </form>
  );
};

const TransactionForm = ({
  formData,
  setFormData,
  onSubmit,
  loading,
  type,
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
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder={`Reason for ${type}`}
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
            ? "Processing..."
            : type === "deposit"
              ? "Deposit"
              : "Withdraw"}
        </Button>
      </div>
    </form>
  );
};

const SavingsDetails = ({ saving }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Account Number
              </Label>
              <p className="text-lg font-medium">
                {saving.accountNumber || `SAV-${saving._id.slice(-6)}`}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Account Type
              </Label>
              <p className="text-lg font-medium capitalize">
                {saving.accountType}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Current Balance
              </Label>
              <p className="text-lg font-medium text-green-600">
                ${saving.balance?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Status
              </Label>
              <p className="text-lg font-medium">
                {saving.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Owner</Label>
              <p className="text-lg font-medium">
                {saving.owner?.name || "Unknown"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Created
              </Label>
              <p className="text-lg font-medium">
                {new Date(saving.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {saving.notes && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Notes</Label>
              <p className="text-sm">{saving.notes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Transaction history will be displayed here.</p>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Savings goals and progress will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavingsPage;
