// src/pages/Loans.jsx
import React, { useState, useEffect, useCallback } from "react";
import { loanService } from "@/services/loanService";
import { useAuth } from "@/context/AuthContext";

// Shadcn UI Components
import {
  Button,
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
  Textarea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  AlertDialog, // Import AlertDialog for delete confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter, // Correct import for AlertDialogFooter
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge, // Import Badge for status display
} from "@/components/ui"; // Correct path for Shadcn UI components
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
  Percent,
  Calendar,
  User,
  Clock,
  Briefcase, // For purpose
  CheckCircle, // For approved/active status
  XCircle, // For rejected status
  Hourglass, // For pending status
  Loader2, // For loading spinners
  Users, // For group filter
  ArrowRight, // For loan term
  TrendingUp, // For stats card
  Handshake, // For total loans
  ClipboardCheck, // For active loans
  HourglassIcon, // For pending loans
} from "lucide-react";

// Custom Components (assuming StatsCard is available)
import { StatsCard } from "@/components/custom/StatsCard"; // Assuming StatsCard is available

export default function Loans() {
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
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for loans data
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [formData, setFormData] = useState({
    borrower: "",
    amount: "",
    interestRate: "",
    term: "",
    purpose: "",
    status: "Pending",
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false); // For form submission loading state
  const [deletingLoanId, setDeletingLoanId] = useState(null); // State for delete loan confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for delete loan dialog

  // Memoize fetchLoans to prevent unnecessary re-renders and re-fetches
  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let params = {};
      if (!isStaff && isAuthenticated && groups.length > 0) {
        // If not staff, filter by user's groups
        params.group = groups.map((g) => g._id || g.id);
      } else if (isStaff && selectedGroup) {
        // If staff and group selected, filter by selected group
        params.group = selectedGroup;
      } else if (isStaff && groups.length > 0 && !selectedGroup) {
        // Staff, no group selected, but groups exist: default to first group
        setSelectedGroup(groups[0]._id || groups[0].id);
        params.group = groups[0]._id || groups[0].id;
      }

      const data = await loanService.getAll(params);
      setLoans(
        Array.isArray(data)
          ? data
          : data.data && Array.isArray(data.data)
            ? data.data
            : []
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to load loans";
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
        fetchLoans();
      } else {
        setLoading(false);
        setError("You must be logged in to view loans.");
      }
    }
  }, [isAuthenticated, authLoading, fetchLoans]);

  // Set initial selected group for staff if groups are loaded
  useEffect(() => {
    if (isStaff && groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, isStaff, selectedGroup]);

  // Re-fetch loans when selectedGroup changes for staff
  useEffect(() => {
    if (isStaff && selectedGroup) {
      fetchLoans();
    }
  }, [selectedGroup, isStaff, fetchLoans]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        term: parseInt(formData.term),
      };

      if (editingLoan) {
        await loanService.update(editingLoan._id || editingLoan.id, payload);
        toast.success("Loan updated successfully.");
      } else {
        await loanService.create(payload);
        toast.success("Loan created successfully.");
      }
      setShowForm(false);
      setEditingLoan(null);
      setFormData({
        borrower: "",
        amount: "",
        interestRate: "",
        term: "",
        purpose: "",
        status: "Pending",
        dueDate: "",
      });
      fetchLoans();
    } catch (err) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormData({
      ...loan,
      amount: loan.amount.toString(), // Convert to string for input value
      interestRate: loan.interestRate.toString(), // Convert to string for input value
      term: loan.term.toString(), // Convert to string for input value
      dueDate: loan.dueDate
        ? new Date(loan.dueDate).toISOString().split("T")[0]
        : "", // Format date for input
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingLoanId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false); // Close dialog first
    if (!deletingLoanId) return;
    try {
      await loanService.remove(deletingLoanId);
      toast.success("Loan deleted successfully.");
      fetchLoans();
    } catch (err) {
      toast.error(err.message || "Failed to delete loan.");
    } finally {
      setDeletingLoanId(null);
    }
  };

  const handleApprove = async (id) => {
    try {
      const loan = loans.find((l) => l.id === id || l._id === id);
      if (!loan) {
        toast.error("Loan not found.");
        return;
      }
      await loanService.update(id, { ...loan, status: "Approved" });
      toast.success("Loan approved.");
      fetchLoans();
    } catch (err) {
      toast.error(err.message || "Failed to approve loan.");
    }
  };

  const handleReject = async (id) => {
    try {
      const loan = loans.find((l) => l.id === id || l._id === id);
      if (!loan) {
        toast.error("Loan not found.");
        return;
      }
      await loanService.update(id, { ...loan, status: "Rejected" });
      toast.success("Loan rejected.");
      fetchLoans();
    } catch (err) {
      toast.error(err.message || "Failed to reject loan.");
    }
  };

  // Calculate loan statistics
  const totalLoans = loans.length;
  const activeLoans = loans.filter((l) => l.status === "Active").length;
  const pendingLoans = loans.filter((l) => l.status === "Pending").length;
  const totalAmount = loans.reduce((sum, l) => sum + Number(l.amount || 0), 0);

  // Render loading and access denied states
  if (authLoading) {
    return (
      <PageLayout title="Loans Management">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication and permissions...
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Loans Management">
        <div className="p-6 text-center text-red-500">
          <DollarSign className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: Please log in to view loans.
        </div>
      </PageLayout>
    );
  }

  // Once authenticated, proceed with data loading or error display for loans
  if (loading && loans.length === 0) {
    return (
      <PageLayout title="Loans Management">
        <div className="p-6 text-center text-muted-foreground">
          Loading loans...
        </div>
      </PageLayout>
    );
  }

  if (error && loans.length === 0) {
    return (
      <PageLayout title="Loans Management">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Loans Management"
      action={
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingLoan(null);
            setFormData({
              borrower: "",
              amount: "",
              interestRate: "",
              term: "",
              purpose: "",
              status: "Pending",
              dueDate: new Date().toISOString().split("T")[0],
            });
          }}
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Loan Application
        </Button>
      }
      headerContent={
        isStaff &&
        groups.length > 0 && (
          <div className="w-full md:w-64">
            <Label htmlFor="group" className="mb-2 block flex items-center">
              <Users className="h-4 w-4 mr-1" /> Group
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
            title="Total Loans"
            value={totalLoans}
            description="All loan applications"
            icon={Handshake}
            trend={{ value: 5, isPositive: true }} // Example trend
          />
          <StatsCard
            title="Active Loans"
            value={activeLoans}
            description="Currently active loans"
            icon={ClipboardCheck}
            className="border-green-200 bg-green-50/50"
            trend={{ value: 3, isPositive: true }} // Example trend
          />
          <StatsCard
            title="Pending Approval"
            value={pendingLoans}
            description="Loans awaiting approval"
            icon={HourglassIcon}
            className="border-yellow-200 bg-yellow-50/50"
            trend={{ value: 2, isPositive: false }} // Example trend
          />
          <StatsCard
            title="Total Amount"
            value={`$${totalAmount.toLocaleString()}`}
            description="Sum of all loan amounts"
            icon={DollarSign}
            className="border-blue-200 bg-blue-50/50"
            trend={{ value: 15000, isPositive: true, isCurrency: true }} // Example trend
          />
        </StatsGrid>
      </PageSection>

      {/* Loans Table Section */}
      <PageSection title="Loan Applications">
        <ContentCard isLoading={loading}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center">
                  <User className="h-4 w-4 mr-2" /> Borrower
                </TableHead>
                <TableHead className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" /> Amount
                </TableHead>
                <TableHead className="flex items-center">
                  <Percent className="h-4 w-4 mr-2" /> Interest
                </TableHead>
                <TableHead className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> Term
                </TableHead>
                <TableHead className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" /> Purpose
                </TableHead>
                <TableHead className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" /> Status
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton rows for loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 bg-muted rounded w-1/2 ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : loans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No loan applications found.
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id || loan._id}>
                    <TableCell className="font-medium">
                      {loan.borrower}
                    </TableCell>
                    <TableCell>${loan.amount?.toLocaleString()}</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{loan.term} months</TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize ${
                          loan.status === "Active"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : loan.status === "Approved"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : loan.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {loan.status === "Pending" &&
                        isStaff && ( // Only staff can approve/reject pending loans
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(loan.id || loan._id)}
                              className="p-0 h-auto mr-2 text-green-600 hover:text-green-800"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(loan.id || loan._id)}
                              className="p-0 h-auto mr-2 text-red-600 hover:text-red-800"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(loan)}
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
                            disabled={deletingLoanId === (loan.id || loan._id)}
                          >
                            {deletingLoanId === (loan.id || loan._id) ? (
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
                              permanently delete the loan application for
                              <span className="font-semibold">
                                {" "}
                                {loan.borrower} (Amount: $
                                {loan.amount?.toLocaleString()})
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

      {/* New/Edit Loan Application Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLoan ? "Edit Loan" : "New Loan Application"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="borrower"
                className="text-right flex items-center"
              >
                <User className="h-4 w-4 mr-1" /> Borrower Name
              </Label>
              <Input
                id="borrower"
                type="text"
                required
                value={formData.borrower}
                onChange={(e) =>
                  setFormData({ ...formData, borrower: e.target.value })
                }
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Loan Amount ($)
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
              <Label
                htmlFor="interestRate"
                className="text-right flex items-center"
              >
                <Percent className="h-4 w-4 mr-1" /> Interest Rate (%)
              </Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                required
                value={formData.interestRate}
                onChange={(e) =>
                  setFormData({ ...formData, interestRate: e.target.value })
                }
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right flex items-center">
                <Clock className="h-4 w-4 mr-1" /> Term (months)
              </Label>
              <Input
                id="term"
                type="number"
                required
                value={formData.term}
                onChange={(e) =>
                  setFormData({ ...formData, term: e.target.value })
                }
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purpose" className="text-right flex items-center">
                <Briefcase className="h-4 w-4 mr-1" /> Purpose
              </Label>
              <Textarea
                id="purpose"
                required
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                className="col-span-3"
                rows="3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={submitting || !isStaff} // Only staff can change status in form
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>{" "}
                  {/* Added Completed status */}
                  <SelectItem value="Overdue">Overdue</SelectItem>{" "}
                  {/* Added Overdue status */}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingLoan(null);
                  setFormData({
                    borrower: "",
                    amount: "",
                    interestRate: "",
                    term: "",
                    purpose: "",
                    status: "Pending",
                    dueDate: "",
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
                {editingLoan ? "Update" : "Submit"} Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete Loan */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              loan application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {" "}
            {/* This is the correct component for AlertDialog */}
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
