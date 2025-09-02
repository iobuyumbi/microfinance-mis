
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  User,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Filter,
  Users,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { memberService } from "../services/memberService";
import MemberForm from "../components/forms/MemberForm";
import { ErrorMessage } from "../components/custom/ErrorBoundary";
import { useSocket } from "../context/SocketContext";

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

  useEffect(() => {
    fetchMembers();
    fetchMemberStats();

    // Socket listeners for real-time updates
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

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, statusFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await memberService.getAllMembers();
      
      // Handle different response structures
      const membersData = response.data?.data || response.data || response;
      
      if (Array.isArray(membersData)) {
        setMembers(membersData);
      } else {
        console.error("Expected array but got:", membersData);
        setMembers([]);
        setError("Invalid data format received from server");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setError(error.message || "Failed to fetch members");
      setMembers([]);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberStats = async () => {
    try {
      const response = await memberService.getMemberStats();
      const statsData = response.data?.data || response.data || response;
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching member stats:", error);
      // Set default stats if API fails
      setStats({
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        suspended: members.filter(m => m.status === 'suspended').length,
      });
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone?.includes(searchTerm) ||
          member.nationalID?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((member) => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
  };

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
      const response = await memberService.createMember(memberData);
      const newMember = response.data?.data || response.data;
      
      if (!socket) {
        // If no socket, update locally
        setMembers(prev => [newMember, ...prev]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          [newMember.status]: prev[newMember.status] + 1
        }));
      }
      
      setShowAddForm(false);
      toast.success("Member created successfully");
    } catch (error) {
      console.error("Error creating member:", error);
      toast.error(error.message || "Failed to create member");
    }
  };

  const handleUpdateMember = async (memberData) => {
    try {
      const response = await memberService.updateMember(editingMember._id, memberData);
      const updatedMember = response.data?.data || response.data;
      
      if (!socket) {
        // If no socket, update locally
        setMembers(prev =>
          prev.map(member =>
            member._id === editingMember._id ? updatedMember : member
          )
        );
      }
      
      setEditingMember(null);
      toast.success("Member updated successfully");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error(error.message || "Failed to update member");
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await memberService.deleteMember(memberId);
      
      if (!socket) {
        // If no socket, update locally
        setMembers(prev => prev.filter(member => member._id !== memberId));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      }
      
      setDeleteConfirm(null);
      toast.success("Member deleted successfully");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error(error.message || "Failed to delete member");
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";
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

  const exportMembers = async () => {
    try {
      const data = await memberService.exportMembers();
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success("Members exported successfully");
    } catch (error) {
      console.error("Error exporting members:", error);
      toast.error("Failed to export members");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load members"
        message={error}
        onRetry={fetchMembers}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage your microfinance group members
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportMembers}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <User className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members by name, email, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <Button variant="outline" onClick={fetchMembers}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No members found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first member."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Card key={member._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {member.nationalID || member._id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {member.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{member.address}</span>
                    </div>
                  )}
                  {member.joinDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Joined {new Date(member.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingMember(member)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {member.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMember(member._id)}
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
      )}

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Add New Member</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </Button>
            </div>
            <MemberForm onSubmit={handleCreateMember} />
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Edit Member</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingMember(null)}
              >
                ×
              </Button>
            </div>
            <MemberForm
              initialData={editingMember}
              onSubmit={handleUpdateMember}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
