import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { guarantorService } from "@/services/guarantorService";
import { formatDate } from "@/utils/formatters";

const guarantorSchema = z.object({
  loan: z.string().min(1, "Loan ID is required"),
  guarantor: z.string().min(1, "Guarantor ID is required"),
  amountGuaranteed: z.number().positive("Amount must be positive"),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

const formFields = [
  {
    name: "loan",
    label: "Loan ID",
    type: "text",
    placeholder: "Enter loan ID",
    required: true,
  },
  {
    name: "guarantor",
    label: "Guarantor ID",
    type: "text",
    placeholder: "Enter guarantor ID",
    required: true,
  },
  {
    name: "amountGuaranteed",
    label: "Amount Guaranteed",
    type: "number",
    placeholder: "Enter amount guaranteed",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
];

const columns = [
  {
    key: "loan",
    label: "Loan ID",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "guarantor",
    label: "Guarantor",
  },
  {
    key: "amountGuaranteed",
    label: "Amount Guaranteed",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        variant={
          value === "approved"
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
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminGuarantorsPage = () => {
  const [guarantors, setGuarantors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch guarantors
  const fetchGuarantors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await guarantorService.getAll();
      setGuarantors(res.data || []);
    } catch (err) {
      setError("Failed to load guarantors");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGuarantors();
  }, []);

  // Handlers
  const handleCreateGuarantor = async (data) => {
    try {
      await guarantorService.create(data);
      toast.success("Guarantor created successfully");
      setShowCreateModal(false);
      fetchGuarantors();
    } catch (error) {
      toast.error("Failed to create guarantor");
      throw error;
    }
  };

  const handleUpdateGuarantor = async (data) => {
    try {
      await guarantorService.update(selectedGuarantor._id, data);
      toast.success("Guarantor updated successfully");
      setShowEditModal(false);
      setSelectedGuarantor(null);
      fetchGuarantors();
    } catch (error) {
      toast.error("Failed to update guarantor");
      throw error;
    }
  };

  const handleDeleteGuarantor = async () => {
    try {
      await guarantorService.delete(selectedGuarantor._id);
      toast.success("Guarantor deleted successfully");
      setShowDeleteModal(false);
      setSelectedGuarantor(null);
      fetchGuarantors();
    } catch (error) {
      toast.error("Failed to delete guarantor");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (guarantor) => {
        setSelectedGuarantor(guarantor);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Guarantor",
      icon: Edit,
      onClick: (guarantor) => {
        setSelectedGuarantor(guarantor);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Guarantor",
      icon: Trash2,
      onClick: (guarantor) => {
        setSelectedGuarantor(guarantor);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guarantor Management</h1>
          <p className="text-muted-foreground">Manage loan guarantors</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guarantor
        </Button>
      </div>
      <DataTable
        data={guarantors}
        columns={columns}
        loading={loading}
        error={error}
        title="Guarantors"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchGuarantors}
      />
      {/* Create Guarantor Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Guarantor"
        description="Add a new guarantor to the system"
        onConfirm={() => {}}
        confirmText="Create Guarantor"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateGuarantor}
          validationSchema={guarantorSchema}
          title=""
          showCancel={false}
          submitText="Create Guarantor"
        />
      </FormModal>
      {/* Edit Guarantor Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Guarantor"
        description="Update guarantor information"
        onConfirm={() => {}}
        confirmText="Update Guarantor"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateGuarantor}
          validationSchema={guarantorSchema}
          defaultValues={selectedGuarantor || {}}
          title=""
          showCancel={false}
          submitText="Update Guarantor"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Guarantor"
        description={`Are you sure you want to delete this guarantor? This action cannot be undone.`}
        onConfirm={handleDeleteGuarantor}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Guarantor Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Guarantor Details"
        description="View guarantor information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedGuarantor && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                Guarantor #{selectedGuarantor._id}
              </h3>
              <p className="text-muted-foreground">
                Loan ID: {selectedGuarantor.loan}
              </p>
              <Badge className="mt-2">{selectedGuarantor.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Guarantor ID
                </label>
                <p className="text-sm">{selectedGuarantor.guarantor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Amount Guaranteed
                </label>
                <p className="text-sm">
                  {selectedGuarantor.amountGuaranteed?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedGuarantor.createdAt))}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminGuarantorsPage;
