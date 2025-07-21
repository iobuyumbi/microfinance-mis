import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { groupService } from "../../services/api";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Table from "../../components/Table";
import CrudForm from "../../components/CrudForm";

const formFields = [
  {
    name: "name",
    label: "Group Name",
    type: "text",
    required: true,
    placeholder: "Enter group name",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter group description",
  },
  {
    name: "meetingDay",
    label: "Meeting Day",
    type: "select",
    required: true,
    options: [
      { value: "monday", label: "Monday" },
      { value: "tuesday", label: "Tuesday" },
      { value: "wednesday", label: "Wednesday" },
      { value: "thursday", label: "Thursday" },
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
      { value: "sunday", label: "Sunday" },
    ],
  },
  {
    name: "meetingTime",
    label: "Meeting Time",
    type: "time",
    required: true,
  },
  {
    name: "maxMembers",
    label: "Maximum Members",
    type: "number",
    min: 1,
    max: 100,
    required: true,
  },
];

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "description", label: "Description" },
  {
    key: "members",
    label: "Members",
    render: (row) => row.members?.length || 0,
  },
  {
    key: "meetingSchedule",
    label: "Meeting Schedule",
    render: (row) =>
      `${
        row.meetingDay.charAt(0).toUpperCase() + row.meetingDay.slice(1)
      }s at ${row.meetingTime}`,
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.status === "active"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        }`}
      >
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </span>
    ),
  },
];

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    fetchGroups();
  }, [sortColumn, sortDirection, pagination.currentPage]);

  const fetchGroups = async () => {
    try {
      const response = await groupService.getAllGroups({
        page: pagination.currentPage,
        sort: sortColumn,
        order: sortDirection,
      });
      setGroups(response.groups);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleCreateGroup = async (data) => {
    try {
      await groupService.createGroup(data);
      toast.success("Group created successfully");
      setModalOpen(false);
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    }
  };

  const handleEditGroup = async (data) => {
    try {
      await groupService.updateGroup(editingGroup._id, data);
      toast.success("Group updated successfully");
      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
      throw error;
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await groupService.deleteGroup(deletingGroup._id);
      toast.success("Group deleted successfully");
      setDeleteModalOpen(false);
      setDeletingGroup(null);
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
    }
  };

  const rowActions = (row) => (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/groups/${row._id}`)}
      >
        <span className="sr-only">View</span>
        View
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setEditingGroup(row);
          setModalOpen(true);
        }}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setDeletingGroup(row);
          setDeleteModalOpen(true);
        }}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Edit Group" : "Create New Group"}
              </DialogTitle>
            </DialogHeader>
            <CrudForm
              fields={formFields}
              initialData={editingGroup}
              onSubmit={editingGroup ? handleEditGroup : handleCreateGroup}
              onCancel={() => {
                setModalOpen(false);
                setEditingGroup(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table
          columns={columns}
          data={groups}
          loading={loading}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          pagination={pagination}
          onPageChange={handlePageChange}
          rowActions={rowActions}
        />
      </CardContent>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <strong>{deletingGroup?.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeletingGroup(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGroup}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
