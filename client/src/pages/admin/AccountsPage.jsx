import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { accountService } from "@/services/accountService";
import { formatDate } from "@/utils/formatters";

const accountSchema = z.object({
  accountNumber: z.string().min(2, "Account number is required"),
  accountName: z.string().min(2, "Account name is required"),
  type: z.enum(["savings", "loan", "revenue", "expense", "other"]),
  balance: z.number().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
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
    name: "accountName",
    label: "Account Name",
    type: "text",
    placeholder: "Enter account name",
    required: true,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { value: "savings", label: "Savings" },
      { value: "loan", label: "Loan" },
      { value: "revenue", label: "Revenue" },
      { value: "expense", label: "Expense" },
      { value: "other", label: "Other" },
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
      { value: "pending", label: "Pending" },
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
    key: "accountName",
    label: "Account Name",
  },
  {
    key: "type",
    label: "Type",
    render: (value) => <Badge>{value}</Badge>,
    filterOptions: [
      { value: "savings", label: "Savings" },
      { value: "loan", label: "Loan" },
      { value: "revenue", label: "Revenue" },
      { value: "expense", label: "Expense" },
      { value: "other", label: "Other" },
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
              : "outline"
        }
      >
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
    ],
  },
  {
    key: "balance",
    label: "Balance",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountService.getAll();
      setAccounts(res.data || []);
    } catch (err) {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAccounts();
  }, []);

  // Handlers
  const handleCreateAccount = async (data) => {
    try {
      await accountService.create(data);
      toast.success("Account created successfully");
      setShowCreateModal(false);
      fetchAccounts();
    } catch (error) {
      toast.error("Failed to create account");
      throw error;
    }
  };

  const handleUpdateAccount = async (data) => {
    try {
      await accountService.update(selectedAccount._id, data);
      toast.success("Account updated successfully");
      setShowEditModal(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error) {
      toast.error("Failed to update account");
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await accountService.remove(selectedAccount._id);
      toast.success("Account deleted successfully");
      setShowDeleteModal(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (account) => {
        setSelectedAccount(account);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Account",
      icon: Edit,
      onClick: (account) => {
        setSelectedAccount(account);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Account",
      icon: Trash2,
      onClick: (account) => {
        setSelectedAccount(account);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Management</h1>
          <p className="text-muted-foreground">Manage system accounts</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>
      <DataTable
        data={accounts}
        columns={columns}
        loading={loading}
        error={error}
        title="Accounts"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchAccounts}
      />
      {/* Create Account Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Account"
        description="Add a new account to the system"
        onConfirm={() => {}}
        confirmText="Create Account"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateAccount}
          validationSchema={accountSchema}
          title=""
          showCancel={false}
          submitText="Create Account"
        />
      </FormModal>
      {/* Edit Account Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Account"
        description="Update account information"
        onConfirm={() => {}}
        confirmText="Update Account"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateAccount}
          validationSchema={accountSchema}
          defaultValues={selectedAccount || {}}
          title=""
          showCancel={false}
          submitText="Update Account"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Account"
        description={`Are you sure you want to delete account #${selectedAccount?.accountNumber}? This action cannot be undone.`}
        onConfirm={handleDeleteAccount}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Account Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Account Details"
        description="View account information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedAccount && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                {selectedAccount.accountName}
              </h3>
              <p className="text-muted-foreground">
                {selectedAccount.accountNumber}
              </p>
              <Badge className="mt-2">{selectedAccount.type}</Badge>
              <Badge
                variant={
                  selectedAccount.status === "active"
                    ? "default"
                    : selectedAccount.status === "inactive"
                      ? "secondary"
                      : "outline"
                }
                className="ml-2"
              >
                {selectedAccount.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Balance
                </label>
                <p className="text-sm">
                  {selectedAccount.balance?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedAccount.createdAt))}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAccountsPage;
