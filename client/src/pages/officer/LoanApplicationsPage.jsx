// client/src/pages/officer/LoanApplicationsPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { loanService } from "@/services/loanService";
import { formatDate } from "@/utils/formatters";

const loanApplicationSchema = z.object({
  applicantName: z.string().min(2, "Applicant name is required"),
  amount: z.number().positive("Amount must be positive"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  term: z.number().positive("Term must be positive"),
  guarantors: z.array(z.string()).min(1, "At least one guarantor is required"),
  documents: z.array(z.string()).optional(),
});

const formFields = [
  {
    name: "applicantName",
    label: "Applicant Name",
    type: "text",
    placeholder: "Enter applicant name",
    required: true,
  },
  {
    name: "amount",
    label: "Loan Amount",
    type: "number",
    placeholder: "Enter loan amount",
    required: true,
  },
  {
    name: "purpose",
    label: "Loan Purpose",
    type: "textarea",
    placeholder: "Describe the purpose of the loan",
    required: true,
  },
  {
    name: "term",
    label: "Loan Term (months)",
    type: "number",
    placeholder: "Enter loan term in months",
    required: true,
  },
  {
    name: "guarantors",
    label: "Guarantors",
    type: "multiselect",
    placeholder: "Select guarantors",
    required: true,
    options: [], // Will be populated from API
  },
  {
    name: "documents",
    label: "Documents",
    type: "file",
    placeholder: "Upload required documents",
    multiple: true,
  },
];

const columns = [
  {
    key: "applicantName",
    label: "Applicant",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "amount",
    label: "Amount",
    render: (value) => <span>{value?.toLocaleString() ?? 0}</span>,
  },
  {
    key: "purpose",
    label: "Purpose",
    render: (value) => <span className="truncate max-w-xs">{value}</span>,
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
              : value === "rejected"
                ? "destructive"
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
      { value: "under_review", label: "Under Review" },
    ],
  },
  {
    key: "submittedAt",
    label: "Submitted",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
  {
    key: "reviewedAt",
    label: "Reviewed",
    type: "date",
    render: (value) => (value ? formatDate(new Date(value)) : "Not reviewed"),
  },
];

const OfficerLoanApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loanService.getAll({ status: "pending" });
      setApplications(res.data || []);
    } catch (err) {
      setError("Failed to load loan applications");
      toast.error("Failed to load loan applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle approve application
  const handleApproveApplication = async (data) => {
    try {
      await loanService.approve(selectedApplication._id, data);
      toast.success("Application approved successfully");
      setShowReviewModal(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      toast.error("Failed to approve application");
      throw error;
    }
  };

  // Handle reject application
  const handleRejectApplication = async (reason) => {
    try {
      await loanService.update(selectedApplication._id, {
        status: "rejected",
        rejectionReason: reason,
      });
      toast.success("Application rejected successfully");
      setShowRejectModal(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      toast.error("Failed to reject application");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (application) => {
        setSelectedApplication(application);
        setShowViewModal(true);
      },
    },
    {
      label: "Approve Application",
      icon: CheckCircle,
      onClick: (application) => {
        setSelectedApplication(application);
        setShowReviewModal(true);
      },
      show: (application) => application.status === "pending",
    },
    {
      label: "Reject Application",
      icon: XCircle,
      onClick: (application) => {
        setSelectedApplication(application);
        setShowRejectModal(true);
      },
      show: (application) => application.status === "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Applications</h1>
          <p className="text-muted-foreground">
            Review and process loan applications from members
          </p>
        </div>
      </div>

      <DataTable
        data={applications}
        columns={columns}
        loading={loading}
        error={error}
        title="Loan Applications"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchApplications}
      />

      {/* View Application Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Loan Application Details"
        description="Review application information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                {selectedApplication.applicantName}
              </h3>
              <p className="text-muted-foreground">
                Application #{selectedApplication._id}
              </p>
              <Badge className="mt-2">{selectedApplication.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Loan Amount
                </label>
                <p className="text-sm font-medium">
                  {selectedApplication.amount?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Loan Term
                </label>
                <p className="text-sm font-medium">
                  {selectedApplication.term} months
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Submitted
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedApplication.submittedAt))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Purpose
                </label>
                <p className="text-sm">{selectedApplication.purpose}</p>
              </div>
            </div>
            {selectedApplication.guarantors && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Guarantors
                </label>
                <div className="flex gap-2 mt-1">
                  {selectedApplication.guarantors.map((guarantor, index) => (
                    <Badge key={index} variant="outline">
                      {guarantor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Review Application Modal */}
      <FormModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        title="Review Application"
        description="Approve this loan application"
        onConfirm={() => {}}
        confirmText="Approve Application"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={[
            {
              name: "notes",
              label: "Review Notes",
              type: "textarea",
              placeholder: "Enter review notes",
            },
            {
              name: "approvedAmount",
              label: "Approved Amount",
              type: "number",
              placeholder: "Enter approved amount",
              required: true,
            },
          ]}
          onSubmit={handleApproveApplication}
          validationSchema={z.object({
            notes: z.string().optional(),
            approvedAmount: z
              .number()
              .positive("Approved amount must be positive"),
          })}
          title=""
          showCancel={false}
          submitText="Approve Application"
        />
      </FormModal>

      {/* Reject Application Modal */}
      <FormModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        title="Reject Application"
        description="Reject this loan application"
        onConfirm={() => {}}
        confirmText="Reject Application"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={[
            {
              name: "rejectionReason",
              label: "Rejection Reason",
              type: "textarea",
              placeholder: "Enter rejection reason",
              required: true,
            },
          ]}
          onSubmit={(data) => handleRejectApplication(data.rejectionReason)}
          validationSchema={z.object({
            rejectionReason: z
              .string()
              .min(10, "Rejection reason must be at least 10 characters"),
          })}
          title=""
          showCancel={false}
          submitText="Reject Application"
        />
      </FormModal>
    </div>
  );
};

export default OfficerLoanApplicationsPage;
