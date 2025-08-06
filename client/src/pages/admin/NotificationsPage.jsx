import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";
import { formatDate } from "@/utils/formatters";

const notificationSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  recipientModel: z.enum(["User", "Group"]).default("User"),
  type: z.string().min(1, "Type is required"),
  message: z.string().min(1, "Message is required"),
  status: z.enum(["unread", "read"]).default("unread"),
});

const formFields = [
  {
    name: "recipient",
    label: "Recipient ID",
    type: "text",
    placeholder: "Enter recipient ID",
    required: true,
  },
  {
    name: "recipientModel",
    label: "Recipient Model",
    type: "select",
    required: true,
    options: [
      { value: "User", label: "User" },
      { value: "Group", label: "Group" },
    ],
  },
  {
    name: "type",
    label: "Type",
    type: "text",
    placeholder: "Enter notification type",
    required: true,
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    placeholder: "Enter notification message",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "unread", label: "Unread" },
      { value: "read", label: "Read" },
    ],
  },
];

const columns = [
  {
    key: "recipient",
    label: "Recipient",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "recipientModel",
    label: "Model",
  },
  {
    key: "type",
    label: "Type",
    render: (value) => <Badge>{value}</Badge>,
  },
  {
    key: "message",
    label: "Message",
    render: (value) => <span className="truncate max-w-xs">{value}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge variant={value === "read" ? "default" : "secondary"}>
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "unread", label: "Unread" },
      { value: "read", label: "Read" },
    ],
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  // Handlers
  const handleCreateNotification = async (data) => {
    try {
      await notificationService.create(data);
      toast.success("Notification created successfully");
      setShowCreateModal(false);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to create notification");
      throw error;
    }
  };

  const handleUpdateNotification = async (data) => {
    try {
      await notificationService.update(selectedNotification._id, data);
      toast.success("Notification updated successfully");
      setShowEditModal(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to update notification");
      throw error;
    }
  };

  const handleDeleteNotification = async () => {
    try {
      await notificationService.remove(selectedNotification._id);
      toast.success("Notification deleted successfully");
      setShowDeleteModal(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (notification) => {
        setSelectedNotification(notification);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Notification",
      icon: Edit,
      onClick: (notification) => {
        setSelectedNotification(notification);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Notification",
      icon: Trash2,
      onClick: (notification) => {
        setSelectedNotification(notification);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage system notifications</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Notification
        </Button>
      </div>
      <DataTable
        data={notifications}
        columns={columns}
        loading={loading}
        error={error}
        title="Notifications"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchNotifications}
      />
      {/* Create Notification Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Notification"
        description="Add a new notification to the system"
        onConfirm={() => {}}
        confirmText="Create Notification"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateNotification}
          validationSchema={notificationSchema}
          title=""
          showCancel={false}
          submitText="Create Notification"
        />
      </FormModal>
      {/* Edit Notification Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Notification"
        description="Update notification information"
        onConfirm={() => {}}
        confirmText="Update Notification"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateNotification}
          validationSchema={notificationSchema}
          defaultValues={selectedNotification || {}}
          title=""
          showCancel={false}
          submitText="Update Notification"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Notification"
        description={`Are you sure you want to delete this notification? This action cannot be undone.`}
        onConfirm={handleDeleteNotification}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Notification Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Notification Details"
        description="View notification information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedNotification && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                {selectedNotification.type}
              </h3>
              <p className="text-muted-foreground">
                Recipient: {selectedNotification.recipient}
              </p>
              <Badge className="mt-2">{selectedNotification.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Recipient Model
                </label>
                <p className="text-sm">{selectedNotification.recipientModel}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedNotification.createdAt))}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Message
                </label>
                <p className="text-sm">{selectedNotification.message}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminNotificationsPage;
