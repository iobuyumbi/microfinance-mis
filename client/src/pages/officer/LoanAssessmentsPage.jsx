// client/src/pages/officer/LoanAssessmentPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, CheckCircle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { loanAssessmentService } from "@/services/loanAssessmentService";
import { formatDate } from "@/utils/formatters";

const assessmentSchema = z.object({
  loanId: z.string().min(1, "Loan ID is required"),
  assessmentDate: z.string().min(1, "Assessment date is required"),
  creditScore: z
    .number()
    .min(0)
    .max(1000, "Credit score must be between 0 and 1000"),
  incomeVerification: z.boolean(),
  employmentVerification: z.boolean(),
  collateralAssessment: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high"]),
  recommendation: z.enum(["approve", "reject", "conditional"]),
  notes: z.string().min(10, "Notes must be at least 10 characters"),
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
    name: "assessmentDate",
    label: "Assessment Date",
    type: "date",
    placeholder: "Select assessment date",
    required: true,
  },
  {
    name: "creditScore",
    label: "Credit Score",
    type: "number",
    placeholder: "Enter credit score (0-1000)",
    required: true,
  },
  {
    name: "incomeVerification",
    label: "Income Verification",
    type: "checkbox",
  },
  {
    name: "employmentVerification",
    label: "Employment Verification",
    type: "checkbox",
  },
  {
    name: "collateralAssessment",
    label: "Collateral Assessment",
    type: "textarea",
    placeholder: "Describe collateral assessment",
  },
  {
    name: "riskLevel",
    label: "Risk Level",
    type: "select",
    required: true,
    options: [
      { value: "low", label: "Low Risk" },
      { value: "medium", label: "Medium Risk" },
      { value: "high", label: "High Risk" },
    ],
  },
  {
    name: "recommendation",
    label: "Recommendation",
    type: "select",
    required: true,
    options: [
      { value: "approve", label: "Approve" },
      { value: "reject", label: "Reject" },
      { value: "conditional", label: "Conditional Approval" },
    ],
  },
  {
    name: "notes",
    label: "Assessment Notes",
    type: "textarea",
    placeholder: "Enter detailed assessment notes",
    required: true,
  },
];

const columns = [
  {
    key: "loanId",
    label: "Loan ID",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "applicantName",
    label: "Applicant",
  },
  {
    key: "assessmentDate",
    label: "Assessment Date",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
  {
    key: "creditScore",
    label: "Credit Score",
    render: (value) => <span>{value}/1000</span>,
  },
  {
    key: "riskLevel",
    label: "Risk Level",
    render: (value) => (
      <Badge
        variant={
          value === "low"
            ? "default"
            : value === "medium"
              ? "secondary"
              : "destructive"
        }
      >
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "low", label: "Low Risk" },
      { value: "medium", label: "Medium Risk" },
      { value: "high", label: "High Risk" },
    ],
  },
  {
    key: "recommendation",
    label: "Recommendation",
    render: (value) => (
      <Badge
        variant={
          value === "approve"
            ? "default"
            : value === "reject"
              ? "destructive"
              : "secondary"
        }
      >
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "approve", label: "Approve" },
      { value: "reject", label: "Reject" },
      { value: "conditional", label: "Conditional" },
    ],
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        variant={
          value === "completed"
            ? "default"
            : value === "in_progress"
              ? "secondary"
              : "outline"
        }
      >
        {value}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const OfficerLoanAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch assessments
  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loanAssessmentService.getAll();
      setAssessments(res.data || []);
    } catch (err) {
      setError("Failed to load loan assessments");
      toast.error("Failed to load loan assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Handle create assessment
  const handleCreateAssessment = async (data) => {
    try {
      await loanAssessmentService.create(data);
      toast.success("Assessment created successfully");
      setShowCreateModal(false);
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to create assessment");
      throw error;
    }
  };

  // Handle update assessment
  const handleUpdateAssessment = async (data) => {
    try {
      await loanAssessmentService.update(selectedAssessment._id, data);
      toast.success("Assessment updated successfully");
      setShowEditModal(false);
      setSelectedAssessment(null);
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to update assessment");
      throw error;
    }
  };

  // Handle delete assessment
  const handleDeleteAssessment = async () => {
    try {
      await loanAssessmentService.remove(selectedAssessment._id);
      toast.success("Assessment deleted successfully");
      setShowDeleteModal(false);
      setSelectedAssessment(null);
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to delete assessment");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (assessment) => {
        setSelectedAssessment(assessment);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Assessment",
      icon: Edit,
      onClick: (assessment) => {
        setSelectedAssessment(assessment);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Assessment",
      icon: FileText,
      onClick: (assessment) => {
        setSelectedAssessment(assessment);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Assessments</h1>
          <p className="text-muted-foreground">
            Conduct and manage loan assessments for applicants
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      <DataTable
        data={assessments}
        columns={columns}
        loading={loading}
        error={error}
        title="Loan Assessments"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchAssessments}
      />

      {/* Create Assessment Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Assessment"
        description="Conduct a new loan assessment"
        onConfirm={() => {}}
        confirmText="Create Assessment"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateAssessment}
          validationSchema={assessmentSchema}
          title=""
          showCancel={false}
          submitText="Create Assessment"
        />
      </FormModal>

      {/* Edit Assessment Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Assessment"
        description="Update assessment information"
        onConfirm={() => {}}
        confirmText="Update Assessment"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateAssessment}
          validationSchema={assessmentSchema}
          defaultValues={selectedAssessment || {}}
          title=""
          showCancel={false}
          submitText="Update Assessment"
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Assessment"
        description={`Are you sure you want to delete this assessment? This action cannot be undone.`}
        onConfirm={handleDeleteAssessment}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* View Assessment Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Assessment Details"
        description="View assessment information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedAssessment && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                Assessment #{selectedAssessment._id}
              </h3>
              <p className="text-muted-foreground">
                Loan ID: {selectedAssessment.loanId}
              </p>
              <Badge className="mt-2">{selectedAssessment.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Assessment Date
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedAssessment.assessmentDate))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Credit Score
                </label>
                <p className="text-sm">{selectedAssessment.creditScore}/1000</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Risk Level
                </label>
                <p className="text-sm">
                  <Badge
                    variant={
                      selectedAssessment.riskLevel === "low"
                        ? "default"
                        : selectedAssessment.riskLevel === "medium"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedAssessment.riskLevel}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Recommendation
                </label>
                <p className="text-sm">
                  <Badge
                    variant={
                      selectedAssessment.recommendation === "approve"
                        ? "default"
                        : selectedAssessment.recommendation === "reject"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {selectedAssessment.recommendation}
                  </Badge>
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Notes
                </label>
                <p className="text-sm">{selectedAssessment.notes}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OfficerLoanAssessmentsPage;
