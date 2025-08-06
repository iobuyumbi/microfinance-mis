// client/src/pages/admin/LoansPage.jsx
import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { loanService } from "@/services/loanService";
import { formatDate } from "@/utils/formatters";

const loanSchema = z.object({
  loanNumber: z.string().min(2, "Loan number is required"),
  borrower: z.string().min(1, "Borrower is required"),
  amount: z.number().positive("Amount must be positive"),
  status: z
    .enum(["pending", "active", "overdue", "completed", "cancelled"])
    .default("pending"),
  appliedDate: z.string().optional(),
  nextPayment: z.string().optional(),
});

const formFields = [
  {
    name: "loanNumber",
    label: "Loan Number",
    type: "text",
    placeholder: "Enter loan number",
    required: true,
  },
  {
    name: "borrower",
    label: "Borrower ID",
    type: "text",
    placeholder: "Enter borrower ID",
    required: true,
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    placeholder: "Enter amount",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "pending", label: "Pending" },
      { value: "active", label: "Active" },
      { value: "overdue", label: "Overdue" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    name: "appliedDate",
    label: "Applied Date",
    type: "date",
    placeholder: "Select applied date",
  },
  {
    name: "nextPayment",
    label: "Next Payment",
    type: "date",
    placeholder: "Select next payment date",
  },
];

const columns = [
  {
    key: "loanNumber",
    label: "Loan Number",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "borrower",
    label: "Borrower",
  },
  {
    key: "amount",
    label: "Amount",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        variant={
          value === "active"
            ? "default"
            : value === "pending"
              ? "secondary"
              : value === "overdue"
                ? "destructive"
                : "outline"
        }
      >
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "pending", label: "Pending" },
      { value: "active", label: "Active" },
      { value: "overdue", label: "Overdue" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "appliedDate",
    label: "Applied Date",
    type: "date",
    render: (value) => (value ? formatDate(new Date(value)) : "N/A"),
  },
  {
    key: "nextPayment",
    label: "Next Payment",
    type: "date",
    render: (value) => (value ? formatDate(new Date(value)) : "N/A"),
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminLoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch loans
  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loanService.getAll();
      setLoans(res.data || []);
    } catch (err) {
      setError("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLoans();
  }, []);

  // Handlers
  const handleCreateLoan = async (data) => {
    try {
      await loanService.create(data);
      toast.success("Loan created successfully");
      setShowCreateModal(false);
      fetchLoans();
    } catch (error) {
      toast.error("Failed to create loan");
      throw error;
    }
  };

  const handleUpdateLoan = async (data) => {
    try {
      await loanService.update(selectedLoan._id, data);
      toast.success("Loan updated successfully");
      setShowEditModal(false);
      setSelectedLoan(null);
      fetchLoans();
    } catch (error) {
      toast.error("Failed to update loan");
      throw error;
    }
  };

  const handleDeleteLoan = async () => {
    try {
      await loanService.remove(selectedLoan._id);
      toast.success("Loan deleted successfully");
      setShowDeleteModal(false);
      setSelectedLoan(null);
      fetchLoans();
    } catch (error) {
      toast.error("Failed to delete loan");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (loan) => {
        setSelectedLoan(loan);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Loan",
      icon: Edit,
      onClick: (loan) => {
        setSelectedLoan(loan);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Loan",
      icon: Trash2,
      onClick: (loan) => {
        setSelectedLoan(loan);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Management</h1>
          <p className="text-muted-foreground">
            Manage all loans and track repayments
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
      </div>
      <DataTable
        data={loans}
        columns={columns}
        loading={loading}
        error={error}
        title="Loans"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchLoans}
      />
      {/* Create Loan Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Loan"
        description="Add a new loan to the system"
        onConfirm={() => {}}
        confirmText="Create Loan"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateLoan}
          validationSchema={loanSchema}
          title=""
          showCancel={false}
          submitText="Create Loan"
        />
      </FormModal>
      {/* Edit Loan Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Loan"
        description="Update loan information"
        onConfirm={() => {}}
        confirmText="Update Loan"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateLoan}
          validationSchema={loanSchema}
          defaultValues={selectedLoan || {}}
          title=""
          showCancel={false}
          submitText="Update Loan"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Loan"
        description={`Are you sure you want to delete loan #${selectedLoan?.loanNumber}? This action cannot be undone.`}
        onConfirm={handleDeleteLoan}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Loan Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Loan Details"
        description="View loan information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedLoan && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                {selectedLoan.loanNumber}
              </h3>
              <p className="text-muted-foreground">
                Borrower: {selectedLoan.borrower}
              </p>
              <Badge className="mt-2">{selectedLoan.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Amount
                </label>
                <p className="text-sm">
                  {selectedLoan.amount?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedLoan.createdAt))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Applied Date
                </label>
                <p className="text-sm">
                  {selectedLoan.appliedDate
                    ? formatDate(new Date(selectedLoan.appliedDate))
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Next Payment
                </label>
                <p className="text-sm">
                  {selectedLoan.nextPayment
                    ? formatDate(new Date(selectedLoan.nextPayment))
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminLoansPage;
