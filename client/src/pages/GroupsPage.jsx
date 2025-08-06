import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Building2,
  UserPlus,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const GroupsPage = () => {
  const {
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    loading,
  } = useApi();
  const { user: currentUser, hasRole } = useAuth();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    meetingDay: "",
    meetingTime: "",
    isActive: true,
    maxMembers: 20,
    notes: "",
  });

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [groups, searchTerm, statusFilter]);

  const loadGroups = async () => {
    try {
      const result = await getGroups();
      if (result.success) {
        setGroups(result.data);
      }
    } catch (error) {
      console.error("Failed to load groups:", error);
    }
  };

  const loadGroupMembers = async (groupId) => {
    try {
      const result = await getGroupMembers(groupId);
      if (result.success) {
        setGroupMembers(result.data);
      }
    } catch (error) {
      console.error("Failed to load group members:", error);
    }
  };

  const filterGroups = () => {
    let filtered = groups;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (group) => group.isActive === (statusFilter === "active")
      );
    }

    setFilteredGroups(filtered);
  };

  const handleCreateGroup = async () => {
    try {
      const result = await createGroup(formData);
      if (result.success) {
        toast.success("Group created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        loadGroups();
      }
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      const result = await updateGroup(selectedGroup._id, formData);
      if (result.success) {
        toast.success("Group updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        loadGroups();
      }
    } catch (error) {
      console.error("Failed to update group:", error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      try {
        const result = await deleteGroup(groupId);
        if (result.success) {
          toast.success("Group deleted successfully");
          loadGroups();
        }
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      meetingDay: "",
      meetingTime: "",
      isActive: true,
      maxMembers: 20,
      notes: "",
    });
    setSelectedGroup(null);
  };

  const openEditDialog = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      location: group.location || "",
      meetingDay: group.meetingDay || "",
      meetingTime: group.meetingTime || "",
      isActive: group.isActive,
      maxMembers: group.maxMembers || 20,
      notes: group.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openMembersDialog = async (group) => {
    setSelectedGroup(group);
    await loadGroupMembers(group._id);
    setIsMembersDialogOpen(true);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getMemberCountBadge = (current, max) => {
    const percentage = (current / max) * 100;
    let variant = "default";
    if (percentage >= 90) variant = "destructive";
    else if (percentage >= 75) variant = "secondary";

    return (
      <Badge variant={variant}>
        {current}/{max} Members
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-600 mt-1">
            Manage microfinance groups and their members
          </p>
        </div>
        {hasRole(["admin", "officer"]) && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new microfinance group with meeting schedule and
                  member limits.
                </DialogDescription>
              </DialogHeader>
              <GroupForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateGroup}
                loading={loading}
                isEdit={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openMembersDialog(group)}>
                      <Users className="mr-2 h-4 w-4" />
                      View Members
                    </DropdownMenuItem>
                    {hasRole(["admin", "officer"]) && (
                      <>
                        <DropdownMenuItem onClick={() => openEditDialog(group)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteGroup(group._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(group.isActive)}
                {getMemberCountBadge(
                  group.memberCount || 0,
                  group.maxMembers || 20
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {group.location && (
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-3 w-3 mr-2" />
                    {group.location}
                  </div>
                )}
                {group.meetingDay && group.meetingTime && (
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-3 w-3 mr-2" />
                    {group.meetingDay} at {group.meetingTime}
                  </div>
                )}
                <div className="flex items-center text-gray-500">
                  <Users className="h-3 w-3 mr-2" />
                  {group.memberCount || 0} members
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openMembersDialog(group)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new microfinance group with meeting schedule and member
              limits.
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateGroup}
            loading={loading}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group information and settings.
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateGroup}
            loading={loading}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup?.name} - Members ({groupMembers.length})
            </DialogTitle>
            <DialogDescription>
              Manage group members and their roles.
            </DialogDescription>
          </DialogHeader>
          <GroupMembersList
            members={groupMembers}
            group={selectedGroup}
            onRefresh={() =>
              selectedGroup && loadGroupMembers(selectedGroup._id)
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const GroupForm = ({ formData, setFormData, onSubmit, loading, isEdit }) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Group Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="City, Country"
          />
        </div>
        <div>
          <Label htmlFor="meetingDay">Meeting Day</Label>
          <Select
            value={formData.meetingDay}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, meetingDay: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monday">Monday</SelectItem>
              <SelectItem value="Tuesday">Tuesday</SelectItem>
              <SelectItem value="Wednesday">Wednesday</SelectItem>
              <SelectItem value="Thursday">Thursday</SelectItem>
              <SelectItem value="Friday">Friday</SelectItem>
              <SelectItem value="Saturday">Saturday</SelectItem>
              <SelectItem value="Sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="meetingTime">Meeting Time</Label>
          <Input
            id="meetingTime"
            name="meetingTime"
            type="time"
            value={formData.meetingTime}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="maxMembers">Maximum Members</Label>
          <Input
            id="maxMembers"
            name="maxMembers"
            type="number"
            min="1"
            max="50"
            value={formData.maxMembers}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="isActive">Status</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive">
              {formData.isActive ? "Active" : "Inactive"}
            </Label>
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="Describe the group's purpose and activities..."
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          placeholder="Additional notes about this group..."
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Group" : "Create Group"}
        </Button>
      </div>
    </form>
  );
};

const GroupMembersList = ({ members, group, onRefresh }) => {
  const { hasRole } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span className="font-medium">Group Members</span>
        </div>
        {hasRole(["admin", "officer"]) && (
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {members.map((member) => (
          <div
            key={member._id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {member.role || "member"}
              </Badge>
              {member.isActive ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No members in this group yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
