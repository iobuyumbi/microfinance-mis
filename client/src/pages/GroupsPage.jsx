import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { groupService } from "../services/groupService";
import { toast } from "sonner";
import FormModal from "../components/modals/FormModal";
import GroupForm from "../components/forms/GroupForm";
import { Building2, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  // Fetch groups from API
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getAll({
        search: searchTerm || undefined,
      });
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle group creation
  const handleCreateGroup = async (groupData) => {
    try {
      await groupService.create(groupData);
      toast.success("Group created successfully");
      setIsCreateGroupOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  // Handle group update
  const handleUpdateGroup = async (groupData) => {
    try {
      await groupService.update(selectedGroup.id, groupData);
      toast.success("Group updated successfully");
      setIsEditGroupOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    }
  };

  // Handle group deletion
  const handleDeleteGroup = async (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await groupService.delete(id);
        toast.success("Group deleted successfully");
        fetchGroups();
      } catch (error) {
        console.error("Error deleting group:", error);
        toast.error("Failed to delete group");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups Management</h1>
          <p className="text-muted-foreground">
            Manage microfinance groups and their members
          </p>
        </div>
        <Button onClick={() => setIsCreateGroupOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search groups..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading groups...</span>
        </div>
      )}

      {/* Groups Table */}
      {!loading && groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Groups Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by creating your first group"}
            </p>
            <Button onClick={() => setIsCreateGroupOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Group
            </Button>
          </CardContent>
        </Card>
      ) : !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Microfinance Groups
            </CardTitle>
            <CardDescription>
              View and manage all groups in the microfinance system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {group.description?.substring(0, 50)}{group.description?.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        {group.memberCount || 0} members
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          group.status === "active"
                            ? "success"
                            : group.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {group.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              to={`/groups/${group.id}`}
                              className="flex items-center w-full"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedGroup(group);
                            setIsEditGroupOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Group
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Group Modal */}
      <FormModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        title="Create New Group"
      >
        <GroupForm onSubmit={handleCreateGroup} />
      </FormModal>

      {/* Edit Group Modal */}
      <FormModal
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
        title="Edit Group"
      >
        <GroupForm 
          onSubmit={handleUpdateGroup} 
          initialData={selectedGroup} 
        />
      </FormModal>
    </div>
  );
};

export default GroupsPage;
