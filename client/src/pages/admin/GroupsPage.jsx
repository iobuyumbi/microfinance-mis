import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { groupService } from "@/services/groupService";
import { formatDate } from "@/utils/formatters";

const groupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
});

const formFields = [
  {
    name: "name",
    label: "Group Name",
    type: "text",
    placeholder: "Enter group name",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter group description",
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
    label: "Group Name",
    render: (value) => <span className="font-medium">{value}</span>,
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
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch groups
  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupService.getAll();
      setGroups(res.data || []);
    } catch (err) {
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGroups();
  }, []);

  // Handlers
  const handleCreateGroup = async (data) => {
    try {
      await groupService.create(data);
      toast.success("Group created successfully");
      setShowCreateModal(false);
      fetchGroups();
    } catch (error) {
      toast.error("Failed to create group");
      throw error;
    }
  };

  const handleUpdateGroup = async (data) => {
    try {
      await groupService.update(selectedGroup._id, data);
      toast.success("Group updated successfully");
      setShowEditModal(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      toast.error("Failed to update group");
      throw error;
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await groupService.delete(selectedGroup._id);
      toast.success("Group deleted successfully");
      setShowDeleteModal(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (group) => {
        setSelectedGroup(group);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Group",
      icon: Edit,
      onClick: (group) => {
        setSelectedGroup(group);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Group",
      icon: Trash2,
      onClick: (group) => {
        setSelectedGroup(group);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Group Management</h1>
          <p className="text-muted-foreground">
            Manage all microfinance groups
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>
      <DataTable
        data={groups}
        columns={columns}
        loading={loading}
        error={error}
        title="Groups"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchGroups}
      />
      {/* Create Group Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Group"
        description="Add a new group to the system"
        onConfirm={() => {}}
        confirmText="Create Group"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateGroup}
          validationSchema={groupSchema}
          title=""
          showCancel={false}
          submitText="Create Group"
        />
      </FormModal>
      {/* Edit Group Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Group"
        description="Update group information"
        onConfirm={() => {}}
        confirmText="Update Group"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateGroup}
          validationSchema={groupSchema}
          defaultValues={selectedGroup || {}}
          title=""
          showCancel={false}
          submitText="Update Group"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Group"
        description={`Are you sure you want to delete ${selectedGroup?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteGroup}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Group Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Group Details"
        description="View group information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedGroup && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{selectedGroup.name}</h3>
              <p className="text-muted-foreground">
                {selectedGroup.description}
              </p>
              <Badge
                variant={
                  selectedGroup.status === "active"
                    ? "default"
                    : selectedGroup.status === "inactive"
                      ? "secondary"
                      : "outline"
                }
                className="mt-2"
              >
                {selectedGroup.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedGroup.createdAt))}
                </p>
              </div>
              {/* Add more group details as needed */}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminGroupsPage;
