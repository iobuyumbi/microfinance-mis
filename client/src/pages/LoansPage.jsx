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
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Calculator,
  CreditCard,
  Users,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const LoansPage = () => {
  const {
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    approveLoan,
    rejectLoan,
    disburseLoan,
    loading,
  } = useApi();
  const { user: currentUser, hasRole } = useAuth();
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    term: "",
    interestRate: "",
    guarantors: [],
    collateral: "",
    notes: "",
  });

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, statusFilter, typeFilter]);

  const loadLoans = async () => {
    try {
      const result = await getLoans();
      if (result.success) {
        setLoans(result.data);
      }
    } catch (error) {
      console.error("Failed to load loans:", error);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (loan) =>
          loan.applicant?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((loan) => loan.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((loan) => loan.type === typeFilter);
    }

    setFilteredLoans(filtered);
  };

  const handleCreateLoan = async () => {
    try {
      const result = await createLoan(formData);
      if (result.success) {
        toast.success("Loan application submitted successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        loadLoans();
      }
    } catch (error) {
      console.error("Failed to create loan:", error);
    }
  };

  const handleUpdateLoan = async () => {
    try {
      const result = await updateLoan(selectedLoan._id, formData);
      if (result.success) {
        toast.success("Loan updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        loadLoans();
      }
    } catch (error) {
      console.error("Failed to update loan:", error);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      const result = await approveLoan(loanId);
      if (result.success) {
        toast.success("Loan approved successfully");
        loadLoans();
      }
    } catch (error) {
      console.error("Failed to approve loan:", error);
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      const result = await rejectLoan(loanId);
      if (result.success) {
        toast.success("Loan rejected successfully");
        loadLoans();
      }
    } catch (error) {
      console.error("Failed to reject loan:", error);
    }
  };

  const handleDisburseLoan = async (loanId) => {
    try {
      const result = await disburseLoan(loanId);
      if (result.success) {
        toast.success("Loan disbursed successfully");
        loadLoans();
      }
    } catch (error) {
      console.error("Failed to disburse loan:", error);
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (window.confirm("Are you sure you want to delete this loan?")) {
      try {
        const result = await deleteLoan(loanId);
        if (result.success) {
          toast.success("Loan deleted successfully");
          loadLoans();
        }
      } catch (error) {
        console.error("Failed to delete loan:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      purpose: "",
      term: "",
      interestRate: "",
      guarantors: [],
      collateral: "",
      notes: "",
    });
    setSelectedLoan(null);
  };

  const openEditDialog = (loan) => {
    setSelectedLoan(loan);
    setFormData({
      amount: loan.amount,
      purpose: loan.purpose,
      term: loan.term,
      interestRate: loan.interestRate,
      guarantors: loan.guarantors || [],
      collateral: loan.collateral || "",
      notes: loan.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (loan) => {
    setSelectedLoan(loan);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      disbursed: "default",
      active: "default",
      completed: "outline",
      defaulted: "destructive",
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      disbursed: DollarSign,
      active: TrendingUp,
      completed: CheckCircle,
      defaulted: AlertCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || "secondary"}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    return (
      <Badge variant="outline" className="capitalize">
        {type}
      </Badge>
    );
  };

  const calculateRepaymentProgress = (loan) => {
    if (!loan.totalAmount || !loan.paidAmount) return 0;
    return Math.round((loan.paidAmount / loan.totalAmount) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600 mt-1">
            Manage loan applications, approvals, and repayments
          </p>
        </div>
        {hasRole(["member", "leader"]) && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Apply for Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Apply for Loan</DialogTitle>
                <DialogDescription>
                  Submit a new loan application with required details and
                  guarantors.
                </DialogDescription>
              </DialogHeader>
              <LoanForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateLoan}
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
                  placeholder="Search loans..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loans List */}
      <Card>
        <CardHeader>
          <CardTitle>Loans ({filteredLoans.length})</CardTitle>
          <CardDescription>
            Manage loan applications and track repayments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLoans.map((loan) => (
              <div
                key={loan._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">
                        {loan.loanNumber || `Loan #${loan._id.slice(-6)}`}
                      </h3>
                      {getStatusBadge(loan.status)}
                      {getTypeBadge(loan.type)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {loan.applicant?.name || "Unknown"}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />$
                        {loan.amount?.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {loan.status === "active" && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Repayment Progress</span>
                          <span>{calculateRepaymentProgress(loan)}%</span>
                        </div>
                        <Progress
                          value={calculateRepaymentProgress(loan)}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
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
                    <DropdownMenuItem onClick={() => openViewDialog(loan)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {hasRole(["admin", "officer"]) &&
                      loan.status === "pending" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleApproveLoan(loan._id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRejectLoan(loan._id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    {hasRole(["admin", "officer"]) &&
                      loan.status === "approved" && (
                        <DropdownMenuItem
                          onClick={() => handleDisburseLoan(loan._id)}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Disburse
                        </DropdownMenuItem>
                      )}
                    {hasRole(["admin", "officer"]) && (
                      <>
                        <DropdownMenuItem onClick={() => openEditDialog(loan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteLoan(loan._id)}
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
            ))}

            {filteredLoans.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No loans found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Loan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for Loan</DialogTitle>
            <DialogDescription>
              Submit a new loan application with required details and
              guarantors.
            </DialogDescription>
          </DialogHeader>
          <LoanForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateLoan}
            loading={loading}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Loan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Loan</DialogTitle>
            <DialogDescription>
              Update loan information and settings.
            </DialogDescription>
          </DialogHeader>
          <LoanForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateLoan}
            loading={loading}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* View Loan Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
            <DialogDescription>
              Complete information about the loan application.
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && <LoanDetails loan={selectedLoan} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LoanForm = ({ formData, setFormData, onSubmit, loading, isEdit }) => {
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
          <Label htmlFor="amount">Loan Amount *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            required
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="term">Loan Term (months) *</Label>
          <Input
            id="term"
            name="term"
            type="number"
            value={formData.term}
            onChange={handleInputChange}
            required
            min="1"
            max="60"
          />
        </div>
        <div>
          <Label htmlFor="interestRate">Interest Rate (%) *</Label>
          <Input
            id="interestRate"
            name="interestRate"
            type="number"
            value={formData.interestRate}
            onChange={handleInputChange}
            required
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <div>
          <Label htmlFor="purpose">Loan Purpose *</Label>
          <Select
            value={formData.purpose}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, purpose: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="home">Home Improvement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="collateral">Collateral/Security</Label>
        <Textarea
          id="collateral"
          name="collateral"
          value={formData.collateral}
          onChange={handleInputChange}
          rows={3}
          placeholder="Describe any collateral or security for the loan..."
        />
      </div>
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          placeholder="Any additional information about the loan application..."
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEdit
              ? "Update Loan"
              : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};

const LoanDetails = ({ loan }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="repayments">Repayments</TabsTrigger>
          <TabsTrigger value="guarantors">Guarantors</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Loan Number
              </Label>
              <p className="text-lg font-medium">
                {loan.loanNumber || `Loan #${loan._id.slice(-6)}`}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Status
              </Label>
              <p className="text-lg font-medium">{loan.status}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Amount
              </Label>
              <p className="text-lg font-medium">
                ${loan.amount?.toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Term</Label>
              <p className="text-lg font-medium">{loan.term} months</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Interest Rate
              </Label>
              <p className="text-lg font-medium">{loan.interestRate}%</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Purpose
              </Label>
              <p className="text-lg font-medium capitalize">{loan.purpose}</p>
            </div>
          </div>

          {loan.collateral && (
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Collateral
              </Label>
              <p className="text-sm">{loan.collateral}</p>
            </div>
          )}

          {loan.notes && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Notes</Label>
              <p className="text-sm">{loan.notes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="repayments" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Repayment schedule and history will be displayed here.</p>
          </div>
        </TabsContent>

        <TabsContent value="guarantors" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Guarantor information will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoansPage;
