// client/src/pages/admin/SavingsPage.jsx
import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { savingsService } from "@/services/savingsService";
import { formatDate } from "@/utils/formatters";

const savingsSchema = z.object({
  accountNumber: z.string().min(2, "Account number is required"),
  member: z.string().min(1, "Member is required"),
  balance: z.number().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

const formFields = [
  {
    name: "accountNumber",
    label: "Account Number",
    type: "text",
    placeholder: "Enter account number",
    required: true,
  },
  {
    name: "member",
    label: "Member ID",
    type: "text",
    placeholder: "Enter member ID",
    required: true,
  },
  {
    name: "balance",
    label: "Initial Balance",
    type: "number",
    placeholder: "Enter initial balance",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
];

const columns = [
  {
    key: "accountNumber",
    label: "Account Number",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "member",
    label: "Member",
  },
  {
    key: "balance",
    label: "Balance",
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
            : value === "inactive"
              ? "secondary"
              : "outline"
        }
      >
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
  {
    key: "lastDeposit",
    label: "Last Deposit",
    type: "date",
    render: (value) => (value ? formatDate(new Date(value)) : "Never"),
  },
  {
    key: "totalDeposits",
    label: "Total Deposits",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "totalWithdrawals",
    label: "Total Withdrawals",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminSavingsPage = () => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSavings, setSelectedSavings] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch savings
  const fetchSavings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await savingsService.getAll();
      setSavings(res.data || []);
    } catch (err) {
      setError("Failed to load savings accounts");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSavings();
  }, []);

  // Handlers
  const handleCreateSavings = async (data) => {
    try {
      await savingsService.create(data);
      toast.success("Savings account created successfully");
      setShowCreateModal(false);
      fetchSavings();
    } catch (error) {
      toast.error("Failed to create savings account");
      throw error;
    }
  };

  const handleUpdateSavings = async (data) => {
    try {
      await savingsService.update(selectedSavings._id, data);
      toast.success("Savings account updated successfully");
      setShowEditModal(false);
      setSelectedSavings(null);
      fetchSavings();
    } catch (error) {
      toast.error("Failed to update savings account");
      throw error;
    }
  };

  const handleDeleteSavings = async () => {
    try {
      await savingsService.remove(selectedSavings._id);
      toast.success("Savings account deleted successfully");
      setShowDeleteModal(false);
      setSelectedSavings(null);
      fetchSavings();
    } catch (error) {
      toast.error("Failed to delete savings account");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (savings) => {
        setSelectedSavings(savings);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Savings",
      icon: Edit,
      onClick: (savings) => {
        setSelectedSavings(savings);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Savings",
      icon: Trash2,
      onClick: (savings) => {
        setSelectedSavings(savings);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Savings Management</h1>
          <p className="text-muted-foreground">
            Manage member savings accounts
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Savings Account
        </Button>
      </div>
      <DataTable
        data={savings}
        columns={columns}
        loading={loading}
        error={error}
        title="Savings Accounts"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchSavings}
      />
      {/* Create Savings Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Savings Account"
        description="Add a new savings account to the system"
        onConfirm={() => {}}
        confirmText="Create Savings Account"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateSavings}
          validationSchema={savingsSchema}
          title=""
          showCancel={false}
          submitText="Create Savings Account"
        />
      </FormModal>
      {/* Edit Savings Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Savings Account"
        description="Update savings account information"
        onConfirm={() => {}}
        confirmText="Update Savings Account"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateSavings}
          validationSchema={savingsSchema}
          defaultValues={selectedSavings || {}}
          title=""
          showCancel={false}
          submitText="Update Savings Account"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Savings Account"
        description={`Are you sure you want to delete savings account #${selectedSavings?.accountNumber}? This action cannot be undone.`}
        onConfirm={handleDeleteSavings}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Savings Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Savings Account Details"
        description="View savings account information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedSavings && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                {selectedSavings.accountNumber}
              </h3>
              <p className="text-muted-foreground">
                Member: {selectedSavings.member}
              </p>
              <Badge className="mt-2">{selectedSavings.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Balance
                </label>
                <p className="text-sm">
                  {selectedSavings.balance?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedSavings.createdAt))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Deposits
                </label>
                <p className="text-sm">
                  {selectedSavings.totalDeposits?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Withdrawals
                </label>
                <p className="text-sm">
                  {selectedSavings.totalWithdrawals?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSavingsPage;
