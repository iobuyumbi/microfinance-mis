// src/components/custom/GroupMemberManagement.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Custom Components
import { DataTable } from "@/components/custom/DataTable";
import { UserAvatar } from "@/components/custom/UserAvatar";

// Lucide React Icons
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Activity,
  Plus,
  Edit,
  Trash2,
  Crown,
  UserCheck,
  UserX,
} from "lucide-react";

import { toast } from "sonner";

export default function GroupMemberManagement({ groupId, onMemberUpdate }) {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Permission checks
  const canManageMembers = () => {
    return (
      currentUser.role === "admin" ||
      currentUser.role === "officer" ||
      currentUser.role === "leader"
    );
  };

  const canEditRoles = () => {
    return (
      currentUser.role === "admin" ||
      currentUser.role === "officer" ||
      currentUser.role === "leader"
    );
  };

  const canAddMembers = () => {
    return (
      currentUser.role === "admin" ||
      currentUser.role === "officer" ||
      currentUser.role === "leader"
    );
  };

  const canRemoveMembers = () => {
    return currentUser.role === "admin" || currentUser.role === "officer";
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchGroupMembers = async () => {
    try {
      setLoading(true);
      const response = await userService.getGroupMembers(groupId);
      const groupMembers = Array.isArray(response.data) ? response.data : [];
      setMembers(groupMembers);
    } catch (err) {
      toast.error("Failed to load group members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      setAddingMember(true);
      await userService.addMemberToGroup(groupId, newMemberEmail);
      toast.success("Member added successfully");
      setNewMemberEmail("");
      setShowAddDialog(false);
      fetchGroupMembers();
      if (onMemberUpdate) onMemberUpdate();
    } catch (err) {
      toast.error(err.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await userService.updateGroupMemberRole(groupId, memberId, newRole);
      toast.success("Member role updated successfully");
      fetchGroupMembers();
      if (onMemberUpdate) onMemberUpdate();
    } catch (err) {
      toast.error(err.message || "Failed to update member role");
    }
  };

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      await userService.updateGroupMemberStatus(groupId, memberId, newStatus);
      toast.success("Member status updated successfully");
      fetchGroupMembers();
      if (onMemberUpdate) onMemberUpdate();
    } catch (err) {
      toast.error(err.message || "Failed to update member status");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await userService.removeMemberFromGroup(groupId, memberId);
      toast.success("Member removed successfully");
      fetchGroupMembers();
      if (onMemberUpdate) onMemberUpdate();
    } catch (err) {
      toast.error(err.message || "Failed to remove member");
    }
  };

  const memberColumns = [
    {
      accessorKey: "name",
      header: "Member",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <UserAvatar user={row.original} size="sm" />
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "groupRole",
      header: "Group Role",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.groupRole === "leader" && (
            <Crown className="h-4 w-4 text-yellow-500" />
          )}
          <Badge variant="outline" className="capitalize">
            {row.original.groupRole || "Member"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "default" : "secondary"}
          className="capitalize"
        >
          {row.original.status === "active" ? (
            <UserCheck className="h-3 w-3 mr-1" />
          ) : (
            <UserX className="h-3 w-3 mr-1" />
          )}
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {canEditRoles() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedMember(row.original);
                setShowRoleDialog(true);
              }}
              disabled={row.original.groupRole === "leader"}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {canRemoveMembers() && row.original.groupRole !== "leader" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleRemoveMember(row.original._id || row.original.id)
              }
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const groupRoles = [
    { value: "member", label: "Member", description: "Regular group member" },
    {
      value: "treasurer",
      label: "Treasurer",
      description: "Manages group finances",
    },
    {
      value: "secretary",
      label: "Secretary",
      description: "Records meetings and activities",
    },
    {
      value: "vice-leader",
      label: "Vice Leader",
      description: "Assists the group leader",
    },
  ];

  const memberStatuses = [
    {
      value: "active",
      label: "Active",
      description: "Fully participating member",
    },
    {
      value: "inactive",
      label: "Inactive",
      description: "Temporarily inactive",
    },
    {
      value: "suspended",
      label: "Suspended",
      description: "Suspended from group activities",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Group Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage members and their roles within this group
          </p>
        </div>
        {canAddMembers() && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Member Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter member's email address"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={addingMember || !newMemberEmail.trim()}
                  >
                    {addingMember ? "Adding..." : "Add Member"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Members ({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={memberColumns}
            data={members}
            searchKey="name"
            searchPlaceholder="Search members..."
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Member Role</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div>
                <Label>Member</Label>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <UserAvatar user={selectedMember} size="sm" />
                  <div>
                    <div className="font-medium">{selectedMember.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedMember.email}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="role">Group Role</Label>
                <Select
                  value={selectedMember.groupRole || "member"}
                  onValueChange={(value) =>
                    handleRoleChange(
                      selectedMember._id || selectedMember.id,
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groupRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedMember.status}
                  onValueChange={(value) =>
                    handleStatusChange(
                      selectedMember._id || selectedMember.id,
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {memberStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div>
                          <div className="font-medium">{status.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {status.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
