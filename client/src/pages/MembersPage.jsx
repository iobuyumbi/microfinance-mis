
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "../components/ui/use-toast";
import { useSocket } from "../contexts/SocketContext";
import { memberService } from "../services/memberService";
import { groupService } from "../services/groupService";
import { Plus, Search, RefreshCw, Users, UserCheck, UserX, ArrowLeft, Mail, Phone, MapPin, Calendar, Edit, Eye, Trash2 } from "lucide-react";
import MemberForm from "../components/forms/MemberForm";
import { ErrorMessage } from "../components/custom/ErrorBoundary";

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
  });
  const [error, setError] = useState(null);
  const { socket } = useSocket();
  const [currentGroup, setCurrentGroup] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const groupId = params.get('groupId');
    if (groupId) {
      fetchGroupDetails(groupId);
    }
  }, [location.search]);

  const fetchGroupDetails = async (groupId) => {
    try {
      const response = await groupService.getById(groupId);
      setCurrentGroup(response.data);
      // Fetch members for this specific group
      fetchGroupMembers(groupId);
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast.error('Failed to load group details');
      // Redirect to members list if group not found
      navigate('/members');
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupService.getMembers(groupId);
      const membersData = response.data?.data || response.data || [];
      setMembers(membersData);
      updateStats(membersData);
    } catch (error) {
      console.error('Error fetching group members:', error);
      setError(error.message || 'Failed to fetch members');
      setMembers([]);
      toast.error('Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await memberService.getAllMembers();
      const membersData = response.data?.data || response.data || [];
      setMembers(membersData);
      updateStats(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError(error.message || 'Failed to fetch members');
      setMembers([]);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentGroup) {
      fetchAllMembers();
    }
    // Socket listeners setup...
  }, [currentGroup, socket]);

  const updateStats = (membersData) => {
    const newStats = {
      total: membersData.length,
      active: membersData.filter(m => m.status === 'active').length,
      inactive: membersData.filter(m => m.status === 'inactive').length,
      suspended: membersData.filter(m => m.status === 'suspended').length,
    };
    setStats(newStats);
  };

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, statusFilter]);

  const filterMembers = () => {
    let filtered = [...members];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name?.toLowerCase().includes(searchLower) ||
          member.email?.toLowerCase().includes(searchLower) ||
          member.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((member) => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
  };

  // Socket event handlers
  useEffect(() => {
    if (socket) {
      socket.on("member_created", handleMemberCreated);
      socket.on("member_updated", handleMemberUpdated);
      socket.on("member_deleted", handleMemberDeleted);

      return () => {
        socket.off("member_created");
        socket.off("member_updated");
        socket.off("member_deleted");
      };
    }
  }, [socket]);

  const handleMemberCreated = (newMember) => {
    setMembers(prev => [newMember, ...prev]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      [newMember.status]: prev[newMember.status] + 1
    }));
    toast.success(`New member ${newMember.name} added`);
  };

  const handleMemberUpdated = (updatedMember) => {
    setMembers(prev => 
      prev.map(member => 
        member._id === updatedMember._id ? updatedMember : member
      )
    );
    toast.info(`Member ${updatedMember.name} updated`);
  };

  const handleMemberDeleted = (deletedMemberId) => {
    setMembers(prev => prev.filter(member => member._id !== deletedMemberId));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1
    }));
    toast.info("Member removed");
  };

  const handleCreateMember = async (memberData) => {
    try {
      if (currentGroup) {
        // Add member to specific group
        await groupService.addMember(currentGroup._id, memberData);
        toast.success('Member added to group successfully');
      } else {
        // Create member without group
        const response = await memberService.createMember(memberData);
        if (!socket) {
          setMembers(prev => [response.data, ...prev]);
          updateStats([...members, response.data]);
        }
        toast.success('Member created successfully');
      }
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create member:', error);
      toast.error(error.response?.data?.message || 'Failed to create member');
    }
  };

  const handleDialogChange = (open) => {
    if (!open) {
      setShowAddForm(false);
      setEditingMember(null);
    }
  };

  const handleUpdateMember = async (memberData) => {
    try {
      if (currentGroup) {
        // Update member in the group context
        await memberService.updateMember(editingMember._id, {
          ...memberData,
          groupId: currentGroup._id
        });
      } else {
        // Update member without group context
        await memberService.updateMember(editingMember._id, memberData);
      }

      if (!socket) {
        const updatedMember = { ...editingMember, ...memberData };
        setMembers(prev =>
          prev.map(member =>
            member._id === editingMember._id ? updatedMember : member
          )
        );
        updateStats([...members.filter(m => m._id !== editingMember._id), updatedMember]);
      }

      setEditingMember(null);
      toast.success('Member updated successfully');
    } catch (error) {
      console.error('Failed to update member:', error);
      toast.error(error.response?.data?.message || 'Failed to update member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      if (currentGroup) {
        // Remove member from group
        await groupService.removeMember(currentGroup._id, memberId);
      } else {
        // Delete member completely
        await memberService.deleteMember(memberId);
      }

      if (!socket) {
        setMembers(prev => prev.filter(member => member._id !== memberId));
        updateStats(members.filter(member => member._id !== memberId));
      }

      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Failed to delete member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      {/* Header with Navigation */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
        <div>
          {currentGroup && (
            <Button
              variant="ghost"
              className="mb-2"
              onClick={() => navigate('/groups')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          )}
          <h1 className="text-3xl font-bold tracking-tight">
            {currentGroup ? `${currentGroup.name} - Members` : 'Members Management'}
          </h1>
          <p className="text-muted-foreground">
            {currentGroup 
              ? `Manage members of ${currentGroup.name}`
              : 'View and manage all members across groups'}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {currentGroup ? `in ${currentGroup.name}` : 'across all groups'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.active / stats.total) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.inactive / stats.total) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Members</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.suspended / stats.total) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => currentGroup ? fetchGroupMembers(currentGroup._id) : fetchAllMembers()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={() =>
                  currentGroup ? fetchGroupMembers(currentGroup._id) : fetchAllMembers()
                }
              >
                Try Again
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No members found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : currentGroup
                  ? `No members in ${currentGroup.name} yet.`
                  : "Get started by adding your first member."}
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Member
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {member.email || member.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={member.status === "active" ? "success" : "secondary"}
                      >
                        {member.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {member.name}? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMember(member._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Member Dialog */}
      <Dialog open={showAddForm || editingMember} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            initialData={editingMember}
            onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
            onCancel={handleDialogChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembersPage;
