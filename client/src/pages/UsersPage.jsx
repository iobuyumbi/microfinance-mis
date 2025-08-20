import React, { useEffect, useState } from "react";
import {
  FacebookCard,
  FacebookCardContent,
  FacebookCardHeader,
} from "../components/ui/facebook-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import FormModal from "../components/modals/FormModal";
import { userService } from "../services/userService";
import { toast } from "sonner";
import { Users, Plus, MoreHorizontal, Building2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [userGroups, setUserGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState({});
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      setUsers(res.data.data || []);
      
      // For each user, fetch their groups
      const usersData = res.data.data || [];
      usersData.forEach(user => {
        fetchUserGroups(user._id);
      });
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserGroups = async (userId) => {
    try {
      setLoadingGroups(prev => ({ ...prev, [userId]: true }));
      const res = await userService.getUserGroups(userId);
      setUserGroups(prev => ({ ...prev, [userId]: res.data.data || [] }));
    } catch (err) {
      console.error(`Failed to load groups for user ${userId}`, err);
      // Don't show toast for each user to avoid spamming
    } finally {
      setLoadingGroups(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setSaving(true);
      console.log("Creating user with data:", createForm);
      await userService.create(createForm);
      toast.success("User created");
      setIsAddOpen(false);
      setCreateForm({ name: "", email: "", password: "", role: "member" });
      fetchUsers();
    } catch (err) {
      console.error("Failed to create user", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await userService.updateUserRoleAndStatus(userId, { role });
      toast.success("Role updated");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const updateStatus = async (userId, status) => {
    try {
      await userService.updateUserRoleAndStatus(userId, { status });
      toast.success("Status updated");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Delete this user?")) return;
    try {
      await userService.deleteUser(userId);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">System Users</h2>
            </div>
            <div className="w-full max-w-sm">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="overflow-hidden rounded-lg border-2 border-blue-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Groups</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {u._id}
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell className="capitalize">
                        {u.status || "active"}
                      </TableCell>
                      <TableCell>
                        {loadingGroups[u._id] ? (
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        ) : userGroups[u._id] && userGroups[u._id].length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Building2 className="mr-2 h-4 w-4" />
                                {userGroups[u._id].length} {userGroups[u._id].length === 1 ? 'Group' : 'Groups'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0">
                              <div className="p-4 border-b">
                                <h4 className="font-medium">Groups for {u.name}</h4>
                                <p className="text-sm text-muted-foreground">User is a member of the following groups</p>
                              </div>
                              <ScrollArea className="h-72">
                                <div className="p-4 space-y-2">
                                  {userGroups[u._id].map((group) => (
                                    <div key={group.groupId} className="border rounded-md p-3">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium">{group.groupName}</div>
                                        <Badge variant={group.groupStatus === 'active' ? 'success' : 'secondary'}>
                                          {group.groupStatus}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-muted-foreground mt-1">{group.groupDescription}</div>
                                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <div className="flex items-center">
                                          <Users className="mr-1 h-3 w-3" />
                                          {group.membersCount || 0} members
                                        </div>
                                        <div>Role: {group.userRoleInGroup}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-sm text-muted-foreground">No groups</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateRole(u._id, "admin")}
                            >
                              Set role: Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRole(u._id, "officer")}
                            >
                              Set role: Officer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRole(u._id, "leader")}
                            >
                              Set role: Leader
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRole(u._id, "member")}
                            >
                              Set role: Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRole(u._id, "user")}
                            >
                              Set role: User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatus(u._id, "active")}
                            >
                              Set status: Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatus(u._id, "inactive")}
                            >
                              Set status: Inactive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteUser(u._id)}
                            >
                              Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </FacebookCardContent>
      </FacebookCard>

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add User"
        description="Create a new user account with appropriate role and permissions."
      >
        <form className="space-y-4" onSubmit={handleCreateUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:border-purple-500 focus:ring-purple-500/20 bg-transparent"
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <option value="member">Member</option>
                <option value="leader">Leader</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default UsersPage;
