import React, { useEffect, useState } from "react";
import { memberService } from @/services/memberServicece";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Users, MapPin, Calendar, Edit, Trash2, Eye } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import GroupForm from "@/components/forms/GroupForm";
import { toast } from "sonner";

const DynamicGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await memberService.getAllGroups();
      setGroups(response.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load groups");
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (formData) => {
    try {
      setFormLoading(true);
      await memberService.createGroup(formData);
      toast.success("Group created successfully!");
      setShowForm(false);
      fetchGroups();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create group");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateGroup = async (formData) => {
    try {
      setFormLoading(true);
      await memberService.updateGroup(editingGroup._id, formData);
      toast.success("Group updated successfully!");
      setShowForm(false);
      setEditingGroup(null);
      fetchGroups();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update group");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      await memberService.deleteGroup(groupId);
      toast.success("Group deleted successfully!");
      fetchGroups();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete group");
    }
  };

  const openEditForm = (group) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGroup(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-1">Manage your microfinance groups</p>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Edit Group" : "Create New Group"}
              </DialogTitle>
            </DialogHeader>
            <GroupForm
              initialData={editingGroup}
              onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}
              onCancel={closeForm}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No groups found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first group
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {group.name}
                  </CardTitle>
                  <Badge className={getStatusColor(group.status)}>
                    {group.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{group.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="capitalize">
                      {group.meetingFrequency} meetings
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {group.memberCount || group.members?.length || 0} members
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      /* TODO: Navigate to group details */
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(group)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteGroup(group._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicGroupsPage;
