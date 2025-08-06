import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Shield, CheckCircle, XCircle } from "lucide-react";
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
  loanId: z.string().min(1, "Loan ID is required"),
  guarantorId: z.string().min(1, "Guarantor ID is required"),
  amountGuaranteed: z.number().positive("Amount must be positive"),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  relationship: z.string().min(1, "Relationship is required"),
  contactInfo: z.string().min(1, "Contact info is required"),
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
    name: "guarantorId",
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
    name: "relationship",
    label: "Relationship",
    type: "select",
    required: true,
    options: [
      { value: "family", label: "Family" },
      { value: "friend", label: "Friend" },
      { value: "colleague", label: "Colleague" },
      { value: "business_partner", label: "Business Partner" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "contactInfo",
    label: "Contact Information",
    type: "textarea",
    placeholder: "Enter contact information",
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
    key: "loanId",
    label: "Loan ID",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "guarantorName",
    label: "Guarantor",
  },
  {
    key: "amountGuaranteed",
    label: "Amount Guaranteed",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "relationship",
    label: "Relationship",
    render: (value) => (
      <Badge variant="outline" className="capitalize">
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "family", label: "Family" },
      { value: "friend", label: "Friend" },
      { value: "colleague", label: "Colleague" },
      { value: "business_partner", label: "Business Partner" },
      { value: "other", label: "Other" },
    ],
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
              : "destructive"
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

const OfficerGuarantorsPage = () => {
  const [guarantors, setGuarantors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Fetch guarantors
  const fetchGuarantors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await guarantorService.getAll();
      setGuarantors(res.data || []);
    } catch (err) {
      setError("Failed to load guarantors");
      toast.error("Failed to load guarantors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuarantors();
  }, []);

  // Handle create guarantor
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

  // Handle update guarantor
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

  // Handle delete guarantor
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

  // Handle approve guarantor
  const handleApproveGuarantor = async (data) => {
    try {
      await guarantorService.update(selectedGuarantor._id, {
        status: "approved",
        approvalNotes: data.notes,
      });
      toast.success("Guarantor approved successfully");
      setShowApproveModal(false);
      setSelectedGuarantor(null);
      fetchGuarantors();
    } catch (error) {
      toast.error("Failed to approve guarantor");
      throw error;
    }
  };

  // Handle reject guarantor
  const handleRejectGuarantor = async (data) => {
    try {
      await guarantorService.update(selectedGuarantor._id, {
        status: "rejected",
        rejectionReason: data.reason,
      });
      toast.success("Guarantor rejected successfully");
      setShowRejectModal(false);
      setSelectedGuarantor(null);
      fetchGuarantors();
    } catch (error) {
      toast.error("Failed to reject guarantor");
      throw error;
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
      label: "Approve Guarantor",
      icon: CheckCircle,
      onClick: (guarantor) => {
        setSelectedGuarantor(guarantor);
        setShowApproveModal(true);
      },
      show: (guarantor) => guarantor.status === "pending",
    },
    {
      label: "Reject Guarantor",
      icon: XCircle,
      onClick: (guarantor) => {
        setSelectedGuarantor(guarantor);
        setShowRejectModal(true);
      },
      show: (guarantor) => guarantor.status === "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guarantors Management</h1>
          <p className="text-muted-foreground">
            Manage and verify loan guarantors
          </p>
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
        title="Add New Guarantor"
        description="Add a new guarantor to the system"
        onConfirm={() => {}}
        confirmText="Add Guarantor"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateGuarantor}
          validationSchema={guarantorSchema}
          title=""
          showCancel={false}
          submitText="Add Guarantor"
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

      {/* Approve Guarantor Modal */}
      <FormModal
        open={showApproveModal}
        onOpenChange={setShowApproveModal}
        title="Approve Guarantor"
        description="Approve this guarantor application"
        onConfirm={() => {}}
        confirmText="Approve Guarantor"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={[
            {
              name: "notes",
              label: "Approval Notes",
              type: "textarea",
              placeholder: "Enter approval notes",
            },
          ]}
          onSubmit={handleApproveGuarantor}
          validationSchema={z.object({
            notes: z.string().optional(),
          })}
          title=""
          showCancel={false}
          submitText="Approve Guarantor"
        />
      </FormModal>

      {/* Reject Guarantor Modal */}
      <FormModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        title="Reject Guarantor"
        description="Reject this guarantor application"
        onConfirm={() => {}}
        confirmText="Reject Guarantor"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={[
            {
              name: "reason",
              label: "Rejection Reason",
              type: "textarea",
              placeholder: "Enter rejection reason",
              required: true,
            },
          ]}
          onSubmit={handleRejectGuarantor}
          validationSchema={z.object({
            reason: z
              .string()
              .min(10, "Rejection reason must be at least 10 characters"),
          })}
          title=""
          showCancel={false}
          submitText="Reject Guarantor"
        />
      </FormModal>

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
                Loan ID: {selectedGuarantor.loanId}
              </p>
              <Badge className="mt-2">{selectedGuarantor.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Guarantor Name
                </label>
                <p className="text-sm">{selectedGuarantor.guarantorName}</p>
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
                  Relationship
                </label>
                <p className="text-sm capitalize">
                  {selectedGuarantor.relationship}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Contact Info
                </label>
                <p className="text-sm">{selectedGuarantor.contactInfo}</p>
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

export default OfficerGuarantorsPage;
