import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { groupService } from "../services/groupService";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Building2,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  Eye,
  UserPlus,
} from "lucide-react";
import GroupForm from "../components/forms/GroupForm";

const GroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteGroupId, setDeleteGroupId] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getAll();
      setGroups(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to fetch groups. Please check the server connection.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await groupService.create(groupData);
      setGroups((prev) => [...prev, response.data?.data]);
      setIsDialogOpen(false);
      toast.success("Group created successfully");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group. " + error.message);
    }
  };

  const handleUpdateGroup = async (id, groupData) => {
    try {
      const response = await groupService.update(id, groupData);
      setGroups((prev) =>
        prev.map((group) => (group._id === id ? response.data?.data : group))
      );
      setEditingGroup(null);
      setIsDialogOpen(false);
      toast.success("Group updated successfully");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group. " + error.message);
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await groupService.delete(id);
      setGroups((prev) => prev.filter((group) => group._id !== id));
      setDeleteGroupId(null);
      toast.success("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group. " + error.message);
    }
  };

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleViewMembers = (groupId) => {
    navigate(`/members?groupId=${groupId}`);
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.leader?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      dissolved: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || colors.inactive;
  };

  const getMemberInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups Management</h1>
          <p className="text-muted-foreground">
            Manage microfinance groups and their members
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGroup(null)}>
              <Plus className="mr-2 h-4 w-4" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Edit Group" : "Create New Group"}
              </DialogTitle>
              <DialogDescription>
                {editingGroup
                  ? "Update the group's information below."
                  : "Fill in the details to create a new microfinance group."}
              </DialogDescription>
            </DialogHeader>
            <GroupForm
              group={editingGroup}
              onSubmit={
                editingGroup
                  ? (data) => handleUpdateGroup(editingGroup._id, data)
                  : handleCreateGroup
              }
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by group name, leader, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Groups Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">
              Active and inactive groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.filter((g) => g.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.reduce(
                (total, group) => total + (group.members?.length || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.length
                ? Math.round(
                    groups.reduce(
                      (total, group) => total + (group.members?.length || 0),
                      0
                    ) / groups.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Members per group</p>
          </CardContent>
        </Card>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <Card
            key={group._id}
            className="transition-all duration-200 hover:shadow-lg"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-1 text-lg">{group.name}</CardTitle>
                  <Badge className={getStatusColor(group.status)}>
                    {group.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {group.members?.length || 0}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.description && (
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    {group.description}
                  </p>
                )}

                {group.leader && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getMemberInitials(group.leader.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {group.leader.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Group Leader
                      </div>
                    </div>
                  </div>
                )}

                {group.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {group.location}
                  </div>
                )}

                {group.meetingFrequency && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {group.meetingFrequency}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewMembers(group._id)}
                  >
                    <Users className="mr-1 h-4 w-4" /> Members
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewGroup(group._id)}
                  >
                    <Eye className="mr-1 h-4 w-4" /> Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingGroup(group);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteGroupId(group._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this group? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteGroup(deleteGroupId)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No groups found</h3>
            <p className="mb-4 text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by creating your first microfinance group"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Group
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupsPage;
