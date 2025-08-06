// client/src/pages/officer/SavingsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Edit,
  PiggyBank,
  TrendingUp,
  DollarSign,
} from "lucide-react";
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
  memberId: z.string().min(1, "Member is required"),
  balance: z.number().min(0, "Balance must be non-negative"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  accountType: z
    .enum(["savings", "fixed_deposit", "emergency"])
    .default("savings"),
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
    name: "memberId",
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
    required: true,
  },
  {
    name: "accountType",
    label: "Account Type",
    type: "select",
    required: true,
    options: [
      { value: "savings", label: "Savings" },
      { value: "fixed_deposit", label: "Fixed Deposit" },
      { value: "emergency", label: "Emergency" },
    ],
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
    key: "memberName",
    label: "Member",
  },
  {
    key: "balance",
    label: "Balance",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "accountType",
    label: "Type",
    render: (value) => (
      <Badge variant="outline" className="capitalize">
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "savings", label: "Savings" },
      { value: "fixed_deposit", label: "Fixed Deposit" },
      { value: "emergency", label: "Emergency" },
    ],
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
              : "destructive"
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
    key: "lastTransaction",
    label: "Last Transaction",
    type: "date",
    render: (value) => (value ? formatDate(new Date(value)) : "Never"),
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const OfficerSavingsPage = () => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSavings, setSelectedSavings] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Fetch savings
  const fetchSavings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await savingsService.getAll();
      setSavings(res.data || []);
    } catch (err) {
      setError("Failed to load savings accounts");
      toast.error("Failed to load savings accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  // Handle create savings
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

  // Handle update savings
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

  // Handle delete savings
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

  // Handle deposit
  const handleDeposit = async (data) => {
    try {
      await savingsService.recordDeposit({
        accountId: selectedSavings._id,
        amount: data.amount,
        description: data.description,
      });
      toast.success("Deposit recorded successfully");
      setShowDepositModal(false);
      setSelectedSavings(null);
      fetchSavings();
    } catch (error) {
      toast.error("Failed to record deposit");
      throw error;
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async (data) => {
    try {
      await savingsService.recordWithdrawal({
        accountId: selectedSavings._id,
        amount: data.amount,
        description: data.description,
      });
      toast.success("Withdrawal recorded successfully");
      setShowWithdrawModal(false);
      setSelectedSavings(null);
      fetchSavings();
    } catch (error) {
      toast.error("Failed to record withdrawal");
      throw error;
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
      label: "Edit Account",
      icon: Edit,
      onClick: (savings) => {
        setSelectedSavings(savings);
        setShowEditModal(true);
      },
    },
    {
      label: "Record Deposit",
      icon: DollarSign,
      onClick: (savings) => {
        setSelectedSavings(savings);
        setShowDepositModal(true);
      },
    },
    {
      label: "Record Withdrawal",
      icon: TrendingUp,
      onClick: (savings) => {
        setSelectedSavings(savings);
        setShowWithdrawModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Savings Management</h1>
          <p className="text-muted-foreground">
            Oversee and manage savings accounts for members
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Account
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
        description="Create a new savings account for a member"
        onConfirm={() => {}}
        confirmText="Create Account"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateSavings}
          validationSchema={savingsSchema}
          title=""
          showCancel={false}
          submitText="Create Account"
        />
      </FormModal>

      {/* Edit Savings Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Savings Account"
        description="Update savings account information"
        onConfirm={() => {}}
        confirmText="Update Account"
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
          submitText="Update Account"
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Savings Account"
        description={`Are you sure you want to delete savings account ${selectedSavings?.accountNumber}? This action cannot be undone.`}
        onConfirm={handleDeleteSavings}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* Deposit Modal */}
      <FormModal
        open={showDepositModal}
        onOpenChange={setShowDepositModal}
        title="Record Deposit"
        description="Record a deposit to this savings account"
        onConfirm={() => {}}
        confirmText="Record Deposit"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={[
            {
              name: "amount",
              label: "Amount",
              type: "number",
              placeholder: "Enter deposit amount",
              required: true,
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              placeholder: "Enter deposit description",
              required: true,
            },
          ]}
          onSubmit={handleDeposit}
          validationSchema={z.object({
            amount: z.number().positive("Amount must be positive"),
            description: z.string().min(1, "Description is required"),
          })}
          title=""
          showCancel={false}
          submitText="Record Deposit"
        />
      </FormModal>

      {/* Withdrawal Modal */}
      <FormModal
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
        title="Record Withdrawal"
        description="Record a withdrawal from this savings account"
        onConfirm={() => {}}
        confirmText="Record Withdrawal"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={[
            {
              name: "amount",
              label: "Amount",
              type: "number",
              placeholder: "Enter withdrawal amount",
              required: true,
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              placeholder: "Enter withdrawal description",
              required: true,
            },
          ]}
          onSubmit={handleWithdrawal}
          validationSchema={z.object({
            amount: z.number().positive("Amount must be positive"),
            description: z.string().min(1, "Description is required"),
          })}
          title=""
          showCancel={false}
          submitText="Record Withdrawal"
        />
      </FormModal>

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
                Member: {selectedSavings.memberName}
              </p>
              <Badge className="mt-2">{selectedSavings.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Balance
                </label>
                <p className="text-sm font-medium">
                  {selectedSavings.balance?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account Type
                </label>
                <p className="text-sm capitalize">
                  {selectedSavings.accountType}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Transaction
                </label>
                <p className="text-sm">
                  {selectedSavings.lastTransaction
                    ? formatDate(new Date(selectedSavings.lastTransaction))
                    : "Never"}
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
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OfficerSavingsPage;
