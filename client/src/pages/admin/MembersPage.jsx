// client/src/pages/admin/MembersPage.jsx
import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { memberService } from "@/services/memberService";
import { formatDate } from "@/utils/formatters";

const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
});

const formFields = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
    required: true,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter email address",
    required: true,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "Enter phone number",
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Enter address",
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
    key: "name",
    label: "Name",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "email",
    label: "Email",
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
    key: "createdAt",
    label: "Joined",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch members
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memberService.getAllMembers();
      setMembers(res.data || []);
    } catch (err) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  // Handlers
  const handleCreateMember = async (data) => {
    try {
      await memberService.createMember(data);
      toast.success("Member created successfully");
      setShowCreateModal(false);
      fetchMembers();
    } catch (error) {
      toast.error("Failed to create member");
      throw error;
    }
  };

  const handleUpdateMember = async (data) => {
    try {
      await memberService.updateMember(selectedMember._id, data);
      toast.success("Member updated successfully");
      setShowEditModal(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (error) {
      toast.error("Failed to update member");
      throw error;
    }
  };

  const handleDeleteMember = async () => {
    try {
      await memberService.deleteMember(selectedMember._id);
      toast.success("Member deleted successfully");
      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (error) {
      toast.error("Failed to delete member");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (member) => {
        setSelectedMember(member);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Member",
      icon: Edit,
      onClick: (member) => {
        setSelectedMember(member);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Member",
      icon: Trash2,
      onClick: (member) => {
        setSelectedMember(member);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Member Management</h1>
          <p className="text-muted-foreground">Manage all members</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>
      <DataTable
        data={members}
        columns={columns}
        loading={loading}
        error={error}
        title="Members"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchMembers}
      />
      {/* Create Member Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Member"
        description="Add a new member to the system"
        onConfirm={() => {}}
        confirmText="Create Member"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateMember}
          validationSchema={memberSchema}
          title=""
          showCancel={false}
          submitText="Create Member"
        />
      </FormModal>
      {/* Edit Member Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Member"
        description="Update member information"
        onConfirm={() => {}}
        confirmText="Update Member"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateMember}
          validationSchema={memberSchema}
          defaultValues={selectedMember || {}}
          title=""
          showCancel={false}
          submitText="Update Member"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Member"
        description={`Are you sure you want to delete ${selectedMember?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteMember}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Member Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Member Details"
        description="View member information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedMember && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
              <p className="text-muted-foreground">{selectedMember.email}</p>
              <Badge
                variant={
                  selectedMember.status === "active"
                    ? "default"
                    : selectedMember.status === "inactive"
                      ? "secondary"
                      : "outline"
                }
                className="mt-2"
              >
                {selectedMember.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Joined
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedMember.createdAt))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p className="text-sm">
                  {selectedMember.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="text-sm">
                  {selectedMember.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMembersPage;
