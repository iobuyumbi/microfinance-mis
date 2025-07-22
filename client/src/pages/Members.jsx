// src/pages/Members.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner'; // For toast notifications

// Lucide React Icons
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Users,
  UserPlus,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Activity,
  TrendingUp,
  UserCheck,
  Clock,
  Target
} from 'lucide-react';

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLayout, PageSection, StatsGrid, FiltersSection, ContentCard } from '@/components/layouts/PageLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Custom Components (assuming these are already defined and styled)
import { PageHeader } from '@/components/custom/PageHeader'; // You need to provide this component
import { DataTable } from '@/components/custom/DataTable'; // You need to provide this component
import { LoadingPage } from '@/components/custom/LoadingSpinner'; // You need to provide this component
import { ErrorMessage } from '@/components/custom/ErrorBoundary'; // You need to provide this component
import { UserAvatar } from '@/components/custom/UserAvatar'; // You need to provide this component
import { StatsCard, StatsGrid } from '@/components/custom/StatsCard'; // You need to provide these components
import MemberForm from '@/components/custom/MemberForm';

// Services and Utilities (assuming these paths are correct)
import { userService } from '@/services/userService';
import { formatDate, formatCurrency, cn } from '@/lib/utils'; // cn is for Tailwind class merging

// Zod schema (re-defined here for clarity, but ideally imported from MemberForm or a shared schema file)
const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  role: z.enum(["member", "leader", "officer"]),
  status: z.enum(["active", "inactive", "suspended"]),
});

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false); // Controls add/edit dialog
  const [editingMember, setEditingMember] = useState(null);
  const [submitting, setSubmitting] = useState(false); // For form submission loading state
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Controls delete confirmation dialog
  const [memberToDelete, setMemberToDelete] = useState(null); // Stores ID of member to delete

  // react-hook-form instance for the form within the dialog
  const form = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "member",
      status: "active",
    },
  });

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAll();
      setMembers(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || "Failed to load members");
      toast.error(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingMember) {
        await userService.update(editingMember._id || editingMember.id, data);
        toast.success("Member updated successfully.");
      } else {
        await userService.create(data);
        toast.success("Member created successfully.");
      }
      setDialogOpen(false);
      setEditingMember(null);
      form.reset();
      fetchMembers();
    } catch (err) {
      toast.error(err.message || "Operation failed.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (member) => {
    setEditingMember(member);
    form.reset({ // Reset form with current member's data
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address || "", // Ensure address is handled if missing
      role: member.role,
      status: member.status,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (memberId) => {
    setMemberToDelete(memberId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    if (!memberToDelete) return;
    try {
      await userService.remove(memberToDelete);
      toast.success("Member deleted successfully.");
      fetchMembers();
    } catch (err) {
      toast.error(err.message || "Failed to delete member.");
    } finally {
      setMemberToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setMemberToDelete(null);
  };

  // Stats calculations
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;
  const suspendedMembers = members.filter(m => m.status === 'suspended').length;
  const leaders = members.filter(m => m.role === 'leader').length;
  const officers = members.filter(m => m.role === 'officer').length;

  // Render loading and error states
  if (loading) return <LoadingPage />;
  if (error) return <ErrorMessage error={error} onRetry={fetchMembers} />;

  // DataTable columns definition
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          {/* UserAvatar is a custom component, ensure it's available */}
          <UserAvatar user={row.original} size="sm" />
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          {row.original.phone}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const roleColors = {
          member: "secondary",
          leader: "default",
          officer: "outline",
        };
        return (
          <Badge variant={roleColors[row.original.role]}>
            {row.original.role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusColors = {
          active: "default",
          inactive: "secondary",
          suspended: "destructive",
        };
        return (
          <Badge variant={statusColors[row.original.status]}>
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteClick(row.original._id || row.original.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Member Management"
        description="Manage your microfinance group members and track their activities"
        action={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {/* DialogTrigger for Add/Edit Member */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingMember(null); // Ensure form is for new member
                  form.reset(memberSchema.parse({})); // Reset form to default values
                }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingMember ? "Edit Member" : "Add New Member"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMember
                      ? "Update member information below."
                      : "Fill in the details to add a new member."
                    }
                  </DialogDescription>
                </DialogHeader>
                {/* MemberForm component is rendered here */}
                <MemberForm
                  initialValues={editingMember || {}}
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setDialogOpen(false);
                    setEditingMember(null);
                    form.reset(); // Reset form on cancel
                  }}
                  loading={submitting}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Member Statistics */}
      <StatsGrid>
        <StatsCard
          title="Total Members"
          value={totalMembers}
          description="All registered members"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Members"
          value={activeMembers}
          description="Currently active"
          icon={UserCheck}
          trend={{ value: 8, isPositive: true }}
          className="border-green-200 bg-green-50/50"
        />
        <StatsCard
          title="Leaders"
          value={leaders}
          description="Group leaders"
          icon={Shield}
          className="border-blue-200 bg-blue-50/50"
        />
        <StatsCard
          title="Suspended"
          value={suspendedMembers}
          description="Suspended members"
          icon={AlertCircle}
          className="border-red-200 bg-red-50/50"
        />
      </StatsGrid>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Members</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="leaders">Leaders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                All Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* DataTable is a custom component, ensure it's available */}
              <DataTable
                columns={columns}
                data={members}
                searchKey="name"
                searchPlaceholder="Search members..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                Active Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={members.filter(m => m.status === 'active')}
                searchKey="name"
                searchPlaceholder="Search active members..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Group Leaders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={members.filter(m => m.role === 'leader' || m.role === 'officer')}
                searchKey="name"
                searchPlaceholder="Search leaders..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Member Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Member growth analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Member Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Activity tracking coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
