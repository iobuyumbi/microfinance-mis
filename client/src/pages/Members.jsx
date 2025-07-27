// src/pages/Members.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner"; // For toast notifications
import { useAuth } from "@/context/AuthContext"; // Import useAuth

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
  Target,
} from "lucide-react";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, // Keep Table imports for DataTable's internal use if needed, or remove if DataTable fully abstracts it
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, // Import AlertDialog for delete confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Custom Components (assuming these are already defined and styled)
import {
  PageLayout,
  StatsGrid,
  ContentCard,
} from "@/components/layouts/PageLayout";
import { DataTable } from "@/components/custom/DataTable"; // You need to provide this component
import { UserAvatar } from "@/components/custom/UserAvatar"; // You need to provide this component
import { StatsCard } from "@/components/custom/StatsCard";
import MemberForm from "@/components/custom/MemberForm";

// Services and Utilities (assuming these paths are correct)
import { userService } from "@/services/userService"; // Ensure this path is correct
import { formatDate, formatCurrency, cn } from "@/lib/utils"; // cn is for Tailwind class merging

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
  const {
    user: currentUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth(); // Get current user and auth status

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for members data
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

  // Fetch members on component mount, but only if authenticated and authorized
  useEffect(() => {
    if (!authLoading) {
      console.log(
        "Members Page - Auth Status:",
        isAuthenticated,
        "User Role:",
        currentUser?.role
      );
      // Only fetch if authenticated AND current user is admin, officer, OR LEADER
      if (
        isAuthenticated &&
        (currentUser?.role === "admin" ||
          currentUser?.role === "officer" ||
          currentUser?.role === "leader")
      ) {
        fetchMembers();
      } else if (isAuthenticated) {
        // If authenticated but not admin/officer/leader, show access denied
        setLoading(false);
        setError("You do not have permission to view this page.");
      } else {
        // Not authenticated
        setLoading(false);
        setError("You must be logged in to view members.");
      }
    }
  }, [isAuthenticated, authLoading, currentUser?.role]); // Depend on auth states and current user's role

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      // CORRECTED: Using userService.getAll() as per your userService.js
      const response = await userService.getAll();
      // Ensure response.data is an array if the service returns { data: [...] }
      setMembers(
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to load members";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingMember) {
        // CORRECTED: Using userService.update() as per your userService.js
        await userService.update(editingMember._id || editingMember.id, data);
        toast.success("Member updated successfully.");
      } else {
        // CORRECTED: Using userService.create() as per your userService.js
        await userService.create(data);
        toast.success("Member created successfully.");
      }
      setDialogOpen(false); // Close the dialog
      setEditingMember(null); // Clear editing state
      form.reset(); // Reset form fields
      fetchMembers(); // Re-fetch members to update the list
    } catch (err) {
      toast.error(err.message || "Operation failed.");
      // Do not throw err here, as it's handled by toast
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (member) => {
    setEditingMember(member);
    form.reset({
      // Reset form with current member's data
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
    setShowConfirmDelete(false); // Close dialog first
    if (!memberToDelete) return; // Should not happen if triggered via dialog
    try {
      // CORRECTED: Using userService.remove() as per your userService.js
      await userService.remove(memberToDelete);
      toast.success("Member deleted successfully.");
      fetchMembers(); // Re-fetch to update the list
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
  const activeMembers = members.filter((m) => m.status === "active").length;
  const inactiveMembers = members.filter((m) => m.status === "inactive").length;
  const suspendedMembers = members.filter(
    (m) => m.status === "suspended"
  ).length;
  const leaders = members.filter((m) => m.role === "leader").length;
  const officers = members.filter((m) => m.role === "officer").length;

  // Render loading and error states based on authentication and authorization
  if (authLoading) {
    return (
      <PageLayout title="Member Management">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication and permissions...
        </div>
      </PageLayout>
    );
  }

  // MODIFIED THIS LINE TO INCLUDE 'leader'
  if (
    !isAuthenticated ||
    (currentUser?.role !== "admin" &&
      currentUser?.role !== "officer" &&
      currentUser?.role !== "leader")
  ) {
    return (
      <PageLayout title="Member Management">
        <div className="p-6 text-center text-red-500">
          <Shield className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: You do not have permission to view this page.
        </div>
      </PageLayout>
    );
  }

  // Once authenticated and authorized, proceed with data loading or error display for members
  if (loading && members.length === 0) {
    return (
      <PageLayout title="Member Management">
        <div className="p-6 text-center text-muted-foreground">
          Loading members...
        </div>
      </PageLayout>
    );
  }

  if (error && members.length === 0) {
    return (
      <PageLayout title="Member Management">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

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
            <div className="text-sm text-muted-foreground">
              {row.original.email}
            </div>
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
          admin: "primary", // Added admin role color
        };
        return (
          <Badge
            variant={roleColors[row.original.role] || "secondary"}
            className="capitalize"
          >
            <Shield className="h-3 w-3 mr-1" /> {row.original.role}
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
          <Badge
            variant={statusColors[row.original.status] || "secondary"}
            className="capitalize"
          >
            <Activity className="h-3 w-3 mr-1" /> {row.original.status}
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
            {/* Edit button only for admin/officer */}
            {(currentUser?.role === "admin" ||
              currentUser?.role === "officer") && (
              <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {/* Delete button only for admin */}
            {currentUser?.role === "admin" && (
              <DropdownMenuItem
                onClick={() =>
                  handleDeleteClick(row.original._id || row.original.id)
                }
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageLayout
      title="Member Management"
      action={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {/* DialogTrigger for Add/Edit Member */}
          {/* Only admin/officer can add members */}
          {(currentUser?.role === "admin" ||
            currentUser?.role === "officer") && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingMember(null); // Ensure form is for new member
                    form.reset(
                      memberSchema.parse({
                        // Reset form to default values
                        name: "",
                        email: "",
                        phone: "",
                        address: "",
                        role: "member",
                        status: "active",
                      })
                    );
                  }}
                >
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
                      : "Fill in the details to add a new member."}
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
                  form={form} // Pass the useForm instance to MemberForm
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      }
    >
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
          className="border-green-200 bg-green-50/50"
          trend={{ value: 8, isPositive: true }}
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
          <ContentCard isLoading={loading} title="All Members">
            <DataTable
              columns={columns}
              data={members}
              searchKey="name"
              searchPlaceholder="Search members..."
            />
          </ContentCard>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <ContentCard isLoading={loading} title="Active Members">
            <DataTable
              columns={columns}
              data={members.filter((m) => m.status === "active")}
              searchKey="name"
              searchPlaceholder="Search active members..."
            />
          </ContentCard>
        </TabsContent>

        <TabsContent value="leaders" className="space-y-4">
          <ContentCard isLoading={loading} title="Group Leaders">
            <DataTable
              columns={columns}
              data={members.filter(
                (m) => m.role === "leader" || m.role === "officer"
              )}
              searchKey="name"
              searchPlaceholder="Search leaders..."
            />
          </ContentCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ContentCard isLoading={loading} title="Member Growth">
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Member growth analytics coming soon...</p>
              </div>
            </ContentCard>

            <ContentCard isLoading={loading} title="Member Activity">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Activity tracking coming soon...</p>
              </div>
            </ContentCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Delete - Changed to AlertDialog */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
