import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Crown,
  Shield,
  User,
  Loader2,
  Plus,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

// Mock data for group member roles and permissions
const GROUP_ROLES = [
  {
    id: "member",
    name: "Member",
    icon: User,
    permissions: ["view_group", "participate_chat"],
  },
  {
    id: "treasurer",
    name: "Treasurer",
    icon: Shield,
    permissions: [
      "view_group",
      "participate_chat",
      "manage_savings",
      "view_financials",
    ],
  },
  {
    id: "secretary",
    name: "Secretary",
    icon: Shield,
    permissions: [
      "view_group",
      "participate_chat",
      "manage_meetings",
      "record_attendance",
    ],
  },
  {
    id: "vice_leader",
    name: "Vice Leader",
    icon: Crown,
    permissions: [
      "view_group",
      "participate_chat",
      "manage_members",
      "approve_small_loans",
    ],
  },
];

export default function GroupMemberManagement({ groupId, groupName }) {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMemberData, setNewMemberData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "member",
  });
  const [editingMemberData, setEditingMemberData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch group members
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual endpoint
      const mockMembers = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          role: "member",
          joinedAt: "2024-01-15",
          status: "active",
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1234567891",
          role: "treasurer",
          joinedAt: "2024-01-10",
          status: "active",
        },
      ];
      setMembers(mockMembers);
    } catch (err) {
      toast.error("Failed to load group members");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async () => {
    setSubmitting(true);
    try {
      // Mock API call - replace with actual endpoint
      const newMember = {
        _id: Date.now().toString(),
        ...newMemberData,
        joinedAt: new Date().toISOString().split("T")[0],
        status: "active",
      };
      setMembers((prev) => [...prev, newMember]);
      setShowAddMember(false);
      setNewMemberData({ name: "", email: "", phone: "", role: "member" });
      toast.success("Member added successfully");
    } catch (err) {
      toast.error("Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMember = async () => {
    setSubmitting(true);
    try {
      // Mock API call - replace with actual endpoint
      setMembers((prev) =>
        prev.map((member) =>
          member._id === selectedMember._id
            ? { ...member, ...editingMemberData }
            : member
        )
      );
      setShowEditMember(false);
      setSelectedMember(null);
      setEditingMemberData({});
      toast.success("Member updated successfully");
    } catch (err) {
      toast.error("Failed to update member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      // Mock API call - replace with actual endpoint
      setMembers((prev) => prev.filter((member) => member._id !== memberId));
      toast.success("Member removed successfully");
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setEditingMemberData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
    });
    setShowEditMember(true);
  };

  const getRoleIcon = (role) => {
    const roleData = GROUP_ROLES.find((r) => r.id === role);
    return roleData ? roleData.icon : User;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "treasurer":
        return "bg-green-100 text-green-800";
      case "secretary":
        return "bg-blue-100 text-blue-800";
      case "vice_leader":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Member Management</h2>
          <p className="text-muted-foreground">
            Manage members and roles for {groupName}
          </p>
        </div>
        <Button onClick={() => setShowAddMember(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Member Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treasurers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((m) => m.role === "treasurer").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secretaries</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((m) => m.role === "secretary").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((m) => m.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                return (
                  <TableRow key={member._id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.email}</div>
                        <div className="text-muted-foreground">
                          {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(member.role)}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {GROUP_ROLES.find((r) => r.id === member.role)?.name ||
                          member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active" ? "default" : "secondary"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.name}{" "}
                                from the group? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newMemberData.name}
                onChange={(e) =>
                  setNewMemberData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter member name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newMemberData.email}
                onChange={(e) =>
                  setNewMemberData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newMemberData.phone}
                onChange={(e) =>
                  setNewMemberData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={newMemberData.role}
                onValueChange={(value) =>
                  setNewMemberData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_ROLES.map((role) => {
                    const RoleIcon = role.icon;
                    return (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-4 w-4" />
                          {role.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditMember} onOpenChange={setShowEditMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editingMemberData.name || ""}
                onChange={(e) =>
                  setEditingMemberData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter member name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingMemberData.email || ""}
                onChange={(e) =>
                  setEditingMemberData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editingMemberData.phone || ""}
                onChange={(e) =>
                  setEditingMemberData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editingMemberData.role || ""}
                onValueChange={(value) =>
                  setEditingMemberData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_ROLES.map((role) => {
                    const RoleIcon = role.icon;
                    return (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-4 w-4" />
                          {role.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMember} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Update Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
