import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
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
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPagination(p => ({ ...p, page: 1 }));
      fetchUsers();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll({ page: pagination.page, limit: pagination.limit, q: search });
      const body = res.data?.data || res.data || {};
      const items = body.items || body;
      setUsers(items || []);
      if (body.total !== undefined) setPagination(prev => ({ ...prev, total: body.total }));
      // For each user, fetch their groups
      (items || []).forEach(user => {
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
    <div className="space-y-6 p-6 pb-16">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">Active system users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">System administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Officers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'officer').length}
            </div>
            <p className="text-xs text-muted-foreground">Loan officers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'member').length}
            </div>
            <p className="text-xs text-muted-foreground">Regular members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>System Users</CardTitle>
              <Badge variant="secondary" className="ml-2">{pagination.total} total</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full max-w-sm">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} 
                disabled={pagination.page <= 1}
              >
                Prev
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} 
                disabled={pagination.page * pagination.limit >= pagination.total}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u._id}</div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={u.status === 'active' ? 'success' : 'secondary'} 
                          className="capitalize"
                        >
                          {u.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {loadingGroups[u._id] ? (
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        ) : userGroups[u._id] && userGroups[u._id].length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Building2 className="mr-2 h-4 w-4" />
                                {userGroups[u._id].length} groups
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <ScrollArea className="h-[200px] w-full">
                                <div className="space-y-2">
                                  {userGroups[u._id].map(group => (
                                    <div key={group._id} className="flex items-center justify-between">
                                      <span>{group.name}</span>
                                      <Badge variant="outline">{group.role}</Badge>
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
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateRole(u._id, 'admin')}>Make Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRole(u._id, 'officer')}>Make Officer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRole(u._id, 'member')}>Make Member</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(u._id, u.status === 'active' ? 'inactive' : 'active')}>
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(u._id)}>
                              Delete
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
        </CardContent>
      </Card>

      <FormModal
        title="Add New User"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateUser}
        loading={saving}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Enter user name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default UsersPage;
