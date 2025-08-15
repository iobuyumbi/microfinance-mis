import React, { useState, useEffect } from "react";
import { StatsCard } from "../components/ui/stats-card";
import {
  FacebookCard,
  FacebookCardHeader,
  FacebookCardContent,
} from "../components/ui/facebook-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { groupService } from "../services/groupService";
import { toast } from "sonner";
import FormModal from "../components/modals/FormModal";
import GroupForm from "../components/forms/GroupForm";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Loader2,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
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
      setGroups(response.data.data || []);
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Groups Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage microfinance groups and their members
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          onClick={() => setIsCreateGroupOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Groups"
          value={groups && groups.length ? groups.length.toString() : "0"}
          description="Active microfinance groups"
          icon={Building2}
          trend="up"
          changeType="positive"
          change="+15%"
        />
        <StatsCard
          title="Total Members"
          value={
            groups && groups.length
              ? groups
                  .reduce((sum, group) => sum + (group.memberCount || 0), 0)
                  .toString()
              : "0"
          }
          description="Across all groups"
          icon={Users}
          changeType="positive"
          change="+8%"
        />
        <StatsCard
          title="Active Groups"
          value={
            groups && groups.length
              ? groups.filter((g) => g.status === "active").length.toString()
              : "0"
          }
          description="Currently meeting regularly"
          icon={CheckCircle}
          changeType="positive"
          change="+12%"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search groups..."
          className="pl-10 border-2 border-blue-200 focus:border-purple-500 focus:ring-purple-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            Loading groups...
          </span>
        </div>
      )}

      {/* Groups Table */}
      {!loading && groups.length === 0 ? (
        <FacebookCard className="border-2 border-blue-200">
          <FacebookCardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              No Groups Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by creating your first group"}
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              onClick={() => setIsCreateGroupOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Group
            </Button>
          </FacebookCardContent>
        </FacebookCard>
      ) : (
        !loading && (
          <FacebookCard className="border-2 border-blue-200">
            <FacebookCardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Microfinance Groups
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View and manage all groups in the microfinance system
              </p>
            </FacebookCardHeader>
            <FacebookCardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <TableHead className="text-blue-900 font-semibold">
                      Group Name
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold">
                      Members
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold">
                      Created
                    </TableHead>
                    <TableHead className="text-right text-blue-900 font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups && groups.length > 0 ? (
                    groups.map((group) => (
                      <TableRow
                        key={group.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{group.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {group.description?.substring(0, 50)}
                                {group.description?.length > 50 ? "..." : ""}
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedGroup(group);
                                  setIsEditGroupOpen(true);
                                }}
                              >
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">
                          No groups found
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </FacebookCardContent>
          </FacebookCard>
        )
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
        <GroupForm onSubmit={handleUpdateGroup} initialData={selectedGroup} />
      </FormModal>
    </div>
  );
};

export default GroupsPage;
