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
  PiggyBank,
  Plus,
  Search,
  Loader2,
  DollarSign,
  Activity,
  MoreHorizontal,
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
import { savingsService } from "../services/savingsService";
import SavingsForm from "../components/forms/SavingsForm";
import { formatCurrency } from "../utils/formatters";

const SavingsPage = () => {
  const [savings, setSavings] = useState([]);
  const [savingsStats, setSavingsStats] = useState({
    totalAccounts: 0,
    totalSavings: 0,
    activeAccounts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateSavingsOpen, setIsCreateSavingsOpen] = useState(false);
  const [isEditSavingsOpen, setIsEditSavingsOpen] = useState(false);
  const [currentSavings, setCurrentSavings] = useState(null);

  // Fetch savings accounts
  useEffect(() => {
    fetchSavings();
    fetchSavingsStats();
  }, []);

  // Filter savings based on search term
  useEffect(() => {
    if (searchTerm) {
      fetchSavings({ search: searchTerm });
    } else {
      fetchSavings();
    }
  }, [searchTerm]);

  const fetchSavings = async (params = {}) => {
    try {
      setLoading(true);
      const response = await savingsService.getAll(params);
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setSavings(data);
    } catch (error) {
      console.error("Error fetching savings:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Failed to fetch savings accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavingsStats = async () => {
    try {
      const response = await savingsService.getStats();
      const stats = response.data?.data;
      if (stats && typeof stats === "object") {
        setSavingsStats({
          totalAccounts: stats.totalAccounts ?? 0,
          totalSavings: stats.totalSavings ?? 0,
          activeAccounts: stats.activeAccounts ?? 0,
        });
      }
    } catch (error) {
      console.error("Error fetching savings stats:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const handleCreateSavings = async (formData) => {
    try {
      await savingsService.create(formData);
      toast.success("Savings account created successfully");
      setIsCreateSavingsOpen(false);
      fetchSavings();
      fetchSavingsStats();
    } catch (error) {
      console.error("Error creating savings account:", error);
      toast.error("Failed to create savings account");
    }
  };

  const handleUpdateSavings = async (formData) => {
    try {
      await savingsService.update(currentSavings._id, formData);
      toast.success("Savings account updated successfully");
      setIsEditSavingsOpen(false);
      fetchSavings();
    } catch (error) {
      console.error("Error updating savings account:", error);
      toast.error("Failed to update savings account");
    }
  };

  const handleDeleteSavings = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this savings account?")
    ) {
      try {
        await savingsService.remove(id);
        toast.success("Savings account deleted successfully");
        fetchSavings();
        fetchSavingsStats();
      } catch (error) {
        console.error("Error deleting savings account:", error);
        toast.error("Failed to delete savings account");
      }
    }
  };

  const handleRecordDeposit = async (id, amount) => {
    try {
      const depositAmount = prompt("Enter deposit amount:");
      if (
        depositAmount &&
        !isNaN(depositAmount) &&
        parseFloat(depositAmount) > 0
      ) {
        await savingsService.recordDeposit(id, {
          amount: parseFloat(depositAmount),
        });
        toast.success(
          `Deposit of ${formatCurrency(
            parseFloat(depositAmount)
          )} recorded successfully`
        );
        fetchSavings();
      }
    } catch (error) {
      console.error("Error recording deposit:", error);
      toast.error("Failed to record deposit");
    }
  };

  const handleRecordWithdrawal = async (id) => {
    try {
      const withdrawalAmount = prompt("Enter withdrawal amount:");
      if (
        withdrawalAmount &&
        !isNaN(withdrawalAmount) &&
        parseFloat(withdrawalAmount) > 0
      ) {
        await savingsService.recordWithdrawal(id, {
          amount: parseFloat(withdrawalAmount),
        });
        toast.success(
          `Withdrawal of ${formatCurrency(
            parseFloat(withdrawalAmount)
          )} recorded successfully`
        );
        fetchSavings();
      }
    } catch (error) {
      console.error("Error recording withdrawal:", error);
      toast.error("Failed to record withdrawal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings</h1>
          <p className="text-muted-foreground">
            Manage savings accounts and transactions
          </p>
        </div>
        <Button onClick={() => setIsCreateSavingsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Savings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
              Savings accounts managed
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
              {formatCurrency(savingsStats.totalSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative savings amount
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Accounts
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savingsStats.activeAccounts}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active savings accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search savings accounts..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Savings Accounts
          </CardTitle>
          <CardDescription>
            View and manage all savings accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : savings.length === 0 ? (
            <div className="text-center py-12">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Savings Accounts Found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No accounts match your search criteria."
                  : "Start by creating a new savings account."}
              </p>
              <Button onClick={() => setIsCreateSavingsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Savings Account
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savings.map((account) => (
                  <TableRow key={account._id}>
                    <TableCell className="font-medium">
                      {account.savingsType}
                    </TableCell>
                    <TableCell>
                      {account.ownerModel === "User" ? "Individual" : "Group"}
                    </TableCell>
                    <TableCell>{formatCurrency(account.balance)}</TableCell>
                    <TableCell>{account.frequency}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          account.status === "active" ? "success" : "secondary"
                        }
                      >
                        {account.status}
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
                              setCurrentSavings(account);
                              setIsEditSavingsOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRecordDeposit(account._id)}
                          >
                            Record Deposit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRecordWithdrawal(account._id)}
                          >
                            Record Withdrawal
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSavings(account._id)}
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

      {/* Create Savings Dialog */}
      <Dialog open={isCreateSavingsOpen} onOpenChange={setIsCreateSavingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Savings Account</DialogTitle>
          </DialogHeader>
          <SavingsForm onSubmit={handleCreateSavings} />
        </DialogContent>
      </Dialog>

      {/* Edit Savings Dialog */}
      <Dialog open={isEditSavingsOpen} onOpenChange={setIsEditSavingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Savings Account</DialogTitle>
          </DialogHeader>
          <SavingsForm
            onSubmit={handleUpdateSavings}
            initialData={currentSavings}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingsPage;
