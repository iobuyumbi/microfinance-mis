import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePaginatedApi } from "@/hooks/useApi";
import { userService } from "@/services/userService";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { getInitials, getRoleDisplayName } from "@/utils/userUtils";
import { formatDate } from "@/utils/formatters";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  // State for modals and forms
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // API hooks
  const {
    data: users,
    loading,
    error,
    pagination,
    fetchData,
    fetchNextPage,
    refresh,
  } = usePaginatedApi(userService.getAll, {
    showErrorToast: true,
    errorMessage: "Failed to load users",
  });

  // Form validation schema
  const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "officer", "member", "leader"]),
    status: z.enum(["active", "inactive", "pending"]),
    phone: z.string().optional(),
    address: z.string().optional(),
  });

  // Form fields configuration
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
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select role",
      required: true,
      options: [
        { value: "member", label: "Member" },
        { value: "leader", label: "Leader" },
        { value: "officer", label: "Officer" },
        { value: "admin", label: "Admin" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
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
  ];

  // Table columns configuration
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(value)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge variant={value === "admin" ? "destructive" : "default"}>
          {getRoleDisplayName(value)}
        </Badge>
      ),
      filterOptions: [
        { value: "admin", label: "Admin" },
        { value: "officer", label: "Officer" },
        { value: "leader", label: "Leader" },
        { value: "member", label: "Member" },
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
      key: "createdAt",
      label: "Joined",
      type: "date",
      render: (value) => formatDate(new Date(value)),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      type: "date",
      render: (value) => (value ? formatDate(new Date(value)) : "Never"),
    },
  ];

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (user) => {
        setSelectedUser(user);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit User",
      icon: Edit,
      onClick: (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete User",
      icon: Trash2,
      onClick: (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
      },
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: "Activate",
      variant: "default",
      icon: Users,
      onClick: async (selectedIds) => {
        try {
          // Implement bulk activation
          toast.success(`${selectedIds.length} users activated`);
        } catch (error) {
          toast.error("Failed to activate users");
        }
      },
    },
    {
      label: "Deactivate",
      variant: "outline",
      icon: Users,
      onClick: async (selectedIds) => {
        try {
          // Implement bulk deactivation
          toast.success(`${selectedIds.length} users deactivated`);
        } catch (error) {
          toast.error("Failed to deactivate users");
        }
      },
    },
  ];

  // Event handlers
  const handleCreateUser = async (data) => {
    try {
      await userService.create(data);
      toast.success("User created successfully");
      setShowCreateModal(false);
      refresh();
    } catch (error) {
      toast.error("Failed to create user");
      throw error;
    }
  };

  const handleUpdateUser = async (data) => {
    try {
      await userService.updateUserRoleAndStatus(selectedUser._id, data);
      toast.success("User updated successfully");
      setShowEditModal(false);
      setSelectedUser(null);
      refresh();
    } catch (error) {
      toast.error("Failed to update user");
      throw error;
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser._id);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setSelectedUser(null);
      refresh();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleExport = (data) => {
    // Implement export functionality
    console.log("Exporting data:", data);
    toast.success("Export functionality will be implemented");
  };

  const handlePageChange = (page) => {
    fetchData({ page, limit: pagination?.limit || 10 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">
            Manage system users and their permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <DataTable
        data={users || []}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={refresh}
        onExport={handleExport}
        title="Users"
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectable={true}
        searchable={true}
        filterable={true}
        exportable={true}
        refreshable={true}
      />

      {/* Create User Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New User"
        description="Add a new user to the system"
        onConfirm={() => {}} // Form handles submission
        confirmText="Create User"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateUser}
          validationSchema={userSchema}
          title=""
          showCancel={false}
          submitText="Create User"
        />
      </FormModal>

      {/* Edit User Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit User"
        description="Update user information"
        onConfirm={() => {}} // Form handles submission
        confirmText="Update User"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateUser}
          validationSchema={userSchema}
          defaultValues={selectedUser || {}}
          title=""
          showCancel={false}
          submitText="Update User"
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteUser}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* View User Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="User Details"
        description="View user information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedUser.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <p className="text-muted-foreground">{selectedUser.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge
                    variant={
                      selectedUser.role === "admin" ? "destructive" : "default"
                    }
                  >
                    {getRoleDisplayName(selectedUser.role)}
                  </Badge>
                  <Badge
                    variant={
                      selectedUser.status === "active"
                        ? "default"
                        : selectedUser.status === "inactive"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p className="text-sm">
                  {selectedUser.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Joined
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedUser.createdAt))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </label>
                <p className="text-sm">
                  {selectedUser.lastLogin
                    ? formatDate(new Date(selectedUser.lastLogin))
                    : "Never"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="text-sm">
                  {selectedUser.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
