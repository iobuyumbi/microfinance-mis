import React, { useState } from "react";
import { Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/DataTable";
import Modal, { ConfirmModal, FormModal } from "@/components/common/Modal";
import Form from "@/components/common/Form";
import { z } from "zod";
import { toast } from "sonner";
import { meetingService } from "@/services/meetingService";
import { formatDate } from "@/utils/formatters";

const meetingSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  group: z.string().min(1, "Group ID is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});

const formFields = [
  {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "Enter meeting title",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter meeting description",
  },
  {
    name: "group",
    label: "Group ID",
    type: "text",
    placeholder: "Enter group ID",
    required: true,
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    placeholder: "Select meeting date",
    required: true,
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "Enter meeting location",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

const columns = [
  {
    key: "title",
    label: "Title",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "group",
    label: "Group",
  },
  {
    key: "date",
    label: "Date",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
  {
    key: "location",
    label: "Location",
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        variant={
          value === "completed"
            ? "default"
            : value === "scheduled"
              ? "secondary"
              : "outline"
        }
      >
        {value}
      </Badge>
    ),
    filterOptions: [
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "createdAt",
    label: "Created",
    type: "date",
    render: (value) => formatDate(new Date(value)),
  },
];

const AdminMeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch meetings
  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await meetingService.getAll();
      setMeetings(res.data || []);
    } catch (err) {
      setError("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMeetings();
  }, []);

  // Handlers
  const handleCreateMeeting = async (data) => {
    try {
      await meetingService.create(data);
      toast.success("Meeting created successfully");
      setShowCreateModal(false);
      fetchMeetings();
    } catch (error) {
      toast.error("Failed to create meeting");
      throw error;
    }
  };

  const handleUpdateMeeting = async (data) => {
    try {
      await meetingService.update(selectedMeeting._id, data);
      toast.success("Meeting updated successfully");
      setShowEditModal(false);
      setSelectedMeeting(null);
      fetchMeetings();
    } catch (error) {
      toast.error("Failed to update meeting");
      throw error;
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      await meetingService.remove(selectedMeeting._id);
      toast.success("Meeting deleted successfully");
      setShowDeleteModal(false);
      setSelectedMeeting(null);
      fetchMeetings();
    } catch (error) {
      toast.error("Failed to delete meeting");
    }
  };

  // Row actions
  const rowActions = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (meeting) => {
        setSelectedMeeting(meeting);
        setShowViewModal(true);
      },
    },
    {
      label: "Edit Meeting",
      icon: Edit,
      onClick: (meeting) => {
        setSelectedMeeting(meeting);
        setShowEditModal(true);
      },
    },
    {
      label: "Delete Meeting",
      icon: Trash2,
      onClick: (meeting) => {
        setSelectedMeeting(meeting);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting Management</h1>
          <p className="text-muted-foreground">Manage all group meetings</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Meeting
        </Button>
      </div>
      <DataTable
        data={meetings}
        columns={columns}
        loading={loading}
        error={error}
        title="Meetings"
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        filterable={true}
        refreshable={true}
        onRefresh={fetchMeetings}
      />
      {/* Create Meeting Modal */}
      <FormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Meeting"
        description="Add a new meeting to the system"
        onConfirm={() => {}}
        confirmText="Create Meeting"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleCreateMeeting}
          validationSchema={meetingSchema}
          title=""
          showCancel={false}
          submitText="Create Meeting"
        />
      </FormModal>
      {/* Edit Meeting Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Meeting"
        description="Update meeting information"
        onConfirm={() => {}}
        confirmText="Update Meeting"
        cancelText="Cancel"
        size="lg"
      >
        <Form
          fields={formFields}
          onSubmit={handleUpdateMeeting}
          validationSchema={meetingSchema}
          defaultValues={selectedMeeting || {}}
          title=""
          showCancel={false}
          submitText="Update Meeting"
        />
      </FormModal>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Meeting"
        description={`Are you sure you want to delete meeting "${selectedMeeting?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteMeeting}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
      {/* View Meeting Modal */}
      <Modal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Meeting Details"
        description="View meeting information"
        size="lg"
        showConfirm={false}
        showCancel={false}
      >
        {selectedMeeting && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{selectedMeeting.title}</h3>
              <p className="text-muted-foreground">
                {selectedMeeting.description}
              </p>
              <Badge className="mt-2">{selectedMeeting.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Group
                </label>
                <p className="text-sm">{selectedMeeting.group}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedMeeting.date))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Location
                </label>
                <p className="text-sm">{selectedMeeting.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDate(new Date(selectedMeeting.createdAt))}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMeetingsPage;
