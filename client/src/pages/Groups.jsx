// src/pages/Groups.jsx
import React, { useState, useEffect } from "react";
import { groupService } from "@/services/groupService";
import { useAuth } from "@/context/AuthContext";
import AuthDebug from "@/components/AuthDebug";

// Shadcn UI Imports
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui";

// Custom Layout Components
import { PageLayout, ContentCard } from "@/components/layouts/PageLayout";
import { toast } from "sonner";

// Lucide React Icons
import { Plus, Edit, Trash, Loader2, Users } from "lucide-react";

export default function Groups() {
  const {
    user: currentUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    meetingFrequency: "monthly",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchGroups();
      } else {
        setLoading(false);
        setError("You must be logged in to view groups.");
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await groupService.getAll();
      setGroups(
        Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to load groups";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingGroup) {
        await groupService.update(
          editingGroup._id || editingGroup.id,
          formData
        );
        toast.success("Group updated successfully.");
      } else {
        // Log the data being sent for creation
        console.log("Attempting to create group with data:", formData);
        await groupService.create(formData);
        toast.success("Group created successfully.");
      }
      setShowForm(false);
      setEditingGroup(null);
      setFormData({ name: "", location: "", meetingFrequency: "monthly" });
      fetchGroups();
    } catch (err) {
      // Log the full error object for better debugging
      console.error("Group creation/update failed:", err);
      toast.error(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      location: group.location,
      meetingFrequency: group.meetingFrequency,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await groupService.remove(id);
      toast.success("Group deleted successfully.");
      fetchGroups();
    } catch (err) {
      console.error("Group deletion failed:", err);
      toast.error(err.message || "Failed to delete group.");
    }
  };

  if (authLoading) {
    return (
      <PageLayout title="Groups Management">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication...
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Groups Management">
        <div className="p-6 text-center text-red-500">
          Access Denied: Please log in to view groups.
        </div>
      </PageLayout>
    );
  }

  if (loading && groups.length === 0) {
    return (
      <PageLayout title="Groups Management">
        <div className="p-6 text-center text-muted-foreground">
          Loading groups...
        </div>
      </PageLayout>
    );
  }

  if (error && groups.length === 0) {
    return (
      <PageLayout title="Groups Management">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <>
      <AuthDebug />
      <PageLayout
        title="Groups Management"
        action={
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingGroup(null);
              setFormData({
                name: "",
                location: "",
                meetingFrequency: "monthly",
              });
            }}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
        }
    >
      <ContentCard isLoading={loading} title="All Groups">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Meeting Frequency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-4 bg-muted rounded w-1/2 ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-4"
                >
                  No groups found. Click "New Group" to add one.
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => (
                <TableRow key={group._id || group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.location}</TableCell>
                  <TableCell>{group.meetingFrequency}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(group)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the group
                            <span className="font-semibold">
                              {" "}
                              "{group.name}"
                            </span>{" "}
                            and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(group._id || group.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ContentCard>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Group" : "New Group"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Group Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meetingFrequency" className="text-right">
                Meeting Frequency
              </Label>
              <Select
                value={formData.meetingFrequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, meetingFrequency: value })
                }
                disabled={submitting}
              >
                <SelectTrigger id="meetingFrequency" className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingGroup(null);
                  setFormData({
                    name: "",
                    location: "",
                    meetingFrequency: "monthly",
                  });
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingGroup ? "Update Group" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
    </>
  );
}
