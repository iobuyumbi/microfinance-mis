import React, { useState } from "react";
import { Plus, Eye, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { repaymentService } from "@/services/repaymentService";
import { formatDate } from "@/utils/formatters";

const repaymentSchema = z.object({
  loanId: z.string().min(1, "Loan ID is required"),
  amountPaid: z.number().positive("Amount must be positive"),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

const formFields = [
  {
    name: "loanId",
    label: "Loan ID",
    type: "text",
    placeholder: "Enter loan ID",
    required: true,
  },
  {
    name: "amountPaid",
    label: "Amount Paid",
    type: "number",
    placeholder: "Enter amount paid",
    required: true,
  },
  {
    name: "paymentDate",
    label: "Payment Date",
    type: "date",
    placeholder: "Select payment date",
  },
  {
    name: "paymentMethod",
    label: "Payment Method",
    type: "text",
    placeholder: "Enter payment method",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Enter notes",
  },
];

const columns = [
  {
    key: "loanId",
    label: "Loan ID",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "amountPaid",
    label: "Amount Paid",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "paymentDate",
    label: "Payment Date",
    type: "date",
    render: (value) => (value ? formatDate(new Date(value)) : "N/A"),
  },
  {
    key: "paymentMethod",
    label: "Payment Method",
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
      { value: "void", label: "Void" },
    ],
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminRepaymentsPage = () => {
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRepayment, setSelectedRepayment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch repayments
  const fetchRepayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await repaymentService.getAll();
      setRepayments(res.data || []);
    } catch (err) {
      setError("Failed to load repayments");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRepayments();
  }, []);

  // Handlers
  const handleCreateRepayment = async (data) => {
    try {
      await repaymentService.create(data);
      toast.success("Repayment created successfully");
      setShowCreateModal(false);
      fetchRepayments();
    } catch (error) {
      toast.error("Failed to create repayment");
      throw error;
    }
  };

  const handleDeleteRepayment = async () => {
    try {
      await repaymentService.void(selectedRepayment._id, {
        reason: "Deleted by admin",
      });
      toast.success("Repayment voided successfully");
      setShowDeleteModal(false);
      setSelectedRepayment(null);
      fetchRepayments();
    } catch (error) {
      toast.error("Failed to void repayment");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (repayment) => {
        setSelectedRepayment(repayment);
        setShowViewModal(true);
      },
    },
    {
      label: "Void Repayment",
      icon: Trash2,
      onClick: (repayment) => {
        setSelectedRepayment(repayment);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repayment Management</h1>
          <p className="text-muted-foreground">Manage loan repayments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Repayment
        </Button>
      </div>
      <DataTable
        data={repayments}
        columns={columns}
        loading={loading}
        error={error}
        title="Repayments"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchRepayments}
      />
      {/* Create Repayment Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Repayment"
        description="Add a new repayment to the system"
        onConfirm={() => {}}
        confirmText="Create Repayment"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateRepayment}
          validationSchema={repaymentSchema}
          title=""
          showCancel={false}
          submitText="Create Repayment"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Void Repayment"
        description={`Are you sure you want to void this repayment? This action cannot be undone.`}
        onConfirm={handleDeleteRepayment}
        confirmText="Void"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Repayment Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Repayment Details"
        description="View repayment information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedRepayment && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                Repayment #{selectedRepayment._id}
              </h3>
              <p className="text-muted-foreground">
                Loan ID: {selectedRepayment.loanId}
              </p>
              <Badge className="mt-2">{selectedRepayment.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Amount Paid
                </label>
                <p className="text-sm">
                  {selectedRepayment.amountPaid?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedRepayment.createdAt))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Payment Date
                </label>
                <p className="text-sm">
                  {selectedRepayment.paymentDate
                    ? formatDate(new Date(selectedRepayment.paymentDate))
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Payment Method
                </label>
                <p className="text-sm">
                  {selectedRepayment.paymentMethod || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Notes
                </label>
                <p className="text-sm">
                  {selectedRepayment.notes || "No notes"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminRepaymentsPage;
