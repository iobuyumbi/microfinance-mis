import React, { useState } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { transactionService } from "@/services/transactionService";
import { formatDate } from "@/utils/formatters";

const transactionSchema = z.object({
  type: z.string().min(2, "Type is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  member: z.string().min(1, "Member is required"),
  group: z.string().min(1, "Group is required"),
  account: z.string().min(1, "Account is required"),
  status: z
    .enum(["completed", "pending", "failed", "cancelled"])
    .default("completed"),
  paymentMethod: z.string().optional(),
});

const formFields = [
  {
    name: "type",
    label: "Type",
    type: "text",
    placeholder: "Enter transaction type",
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
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
  },
  {
    name: "member",
    label: "Member ID",
    type: "text",
    placeholder: "Enter member ID",
    required: true,
  },
  {
    name: "group",
    label: "Group ID",
    type: "text",
    placeholder: "Enter group ID",
    required: true,
  },
  {
    name: "account",
    label: "Account ID",
    type: "text",
    placeholder: "Enter account ID",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    name: "paymentMethod",
    label: "Payment Method",
    type: "text",
    placeholder: "Enter payment method",
  },
];

const columns = [
  {
    key: "type",
    label: "Type",
    render: (value) => <Badge>{value}</Badge>,
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
          value === "completed"
            ? "default"
            : value === "pending"
              ? "secondary"
              : "outline"
        }
      >
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "member",
    label: "Member",
  },
  {
    key: "group",
    label: "Group",
  },
  {
    key: "account",
    label: "Account",
  },
  {
    key: "createdAt",
    label: "Date",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionService.getAll();
      setTransactions(res.data || []);
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  // Handlers
  const handleCreateTransaction = async (data) => {
    try {
      await transactionService.create(data);
      toast.success("Transaction created successfully");
      setShowCreateModal(false);
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to create transaction");
      throw error;
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await transactionService.remove(selectedTransaction._id);
      toast.success("Transaction deleted successfully");
      setShowDeleteModal(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (transaction) => {
        setSelectedTransaction(transaction);
        setShowViewModal(true);
      },
    },
    {
      label: "Delete Transaction",
      icon: Trash2,
      onClick: (transaction) => {
        setSelectedTransaction(transaction);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">Manage all transactions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>
      <DataTable
        data={transactions}
        columns={columns}
        loading={loading}
        error={error}
        title="Transactions"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchTransactions}
      />
      {/* Create Transaction Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Transaction"
        description="Add a new transaction to the system"
        onConfirm={() => {}}
        confirmText="Create Transaction"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateTransaction}
          validationSchema={transactionSchema}
          title=""
          showCancel={false}
          submitText="Create Transaction"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Transaction"
        description={`Are you sure you want to delete this transaction? This action cannot be undone.`}
        onConfirm={handleDeleteTransaction}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Transaction Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Transaction Details"
        description="View transaction information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                {selectedTransaction.type}
              </h3>
              <p className="text-muted-foreground">
                Amount: {selectedTransaction.amount?.toLocaleString() ?? 0}
              </p>
              <Badge className="mt-2">{selectedTransaction.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Member
                </label>
                <p className="text-sm">{selectedTransaction.member}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Group
                </label>
                <p className="text-sm">{selectedTransaction.group}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account
                </label>
                <p className="text-sm">{selectedTransaction.account}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedTransaction.createdAt))}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm">
                  {selectedTransaction.description || "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTransactionsPage;
