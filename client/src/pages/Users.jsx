// src/pages/Users.jsx
import React, { useState, useEffect, useCallback } from "react";
import { userService } from "@/services/userService"; // Assuming this path is correct
import { useAuth } from "@/context/AuthContext"; // Import useAuth for authentication and roles

// Shadcn UI Components
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Correct import for Dialog
  AlertDialog, // Import AlertDialog for delete confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter, // Correct import for AlertDialog
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge, // Import Badge for role/status display
} from "@/components/ui"; // Correct path for Shadcn UI components
import {
  PageLayout,
  PageSection,
  StatsGrid,
  ContentCard,
} from "@/components/layouts/PageLayout";
import { toast } from "sonner"; // For toast notifications

// Import Lucide React Icons
import {
  Plus,
  Edit,
  Trash2,
  Users as UsersIcon, // Renamed to avoid conflict with component name
  User as UserOutline, // For individual user
  Mail, // For email
  Shield, // For role
  Loader2, // For loading spinners
  UserCheck, // For active users
  UserX, // For inactive users
  UserMinus, // For suspended users
  TrendingUp, // For stats
} from "lucide-react";

// Import modular components
import UserForm from "@/components/custom/UserForm";
import UserStats from "@/components/custom/UserStats";
import UserTable from "@/components/custom/UserTable";
import UserFormDialog from "@/components/custom/UserFormDialog";
import UserDeleteConfirmationDialog from "@/components/custom/UserDeleteConfirmationDialog";

export default function Users() {
  const {
    user: currentUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  // Assuming only admin/officer can manage users
  const canManageUsers =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "officer");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for users data
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false); // Controls add/edit dialog
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false); // For form submission loading state
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Memoize fetchUsers to prevent unnecessary re-renders and re-fetches
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await userService.getAll();
      setUsers(
        Array.isArray(data)
          ? data
          : data.users && Array.isArray(data.users)
            ? data.users
            : []
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to load users";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies as it fetches all users

  // Initial fetch on component mount and when auth status changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && canManageUsers) {
        fetchUsers();
      } else {
        setLoading(false);
        setError("Access Denied: You do not have permission to view users.");
      }
    }
  }, [isAuthenticated, authLoading, canManageUsers, fetchUsers]);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await userService.create(formData);
      toast.success("User created successfully.");
      setShowForm(false);
      fetchUsers(); // Re-fetch users to update the list
    } catch (err) {
      const errorMessage =
        err.message || err.response?.data?.message || "Failed to create user";
      toast.error(errorMessage);
      throw new Error(errorMessage); // Re-throw to allow UserForm to catch and display its own error
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (formData) => {
    setSubmitting(true);
    try {
      await userService.update(editingUser._id || editingUser.id, formData);
      toast.success("User updated successfully.");
      setShowForm(false);
      setEditingUser(null);
      fetchUsers(); // Re-fetch users to update the list
    } catch (err) {
      const errorMessage =
        err.message || err.response?.data?.message || "Failed to update user";
      toast.error(errorMessage);
      throw new Error(errorMessage); // Re-throw to allow UserForm to catch and display its own error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (userId) => {
    const user = users.find((u) => (u._id || u.id) === userId);
    setUserToDelete(user);
    setDeletingUserId(userId);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    if (!deletingUserId) return;

    try {
      await userService.remove(deletingUserId);
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (err) {
      toast.error(
        err.message || err.response?.data?.message || "Failed to delete user"
      );
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Render loading and access denied states
  if (authLoading) {
    return (
      <PageLayout title="User Management">
        <div className="p-6 text-center text-muted-foreground">
          Checking authentication and permissions...
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated || !canManageUsers) {
    return (
      <PageLayout title="User Management">
        <div className="p-6 text-center text-red-500">
          <UsersIcon className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: You do not have permission to view or manage users.
        </div>
      </PageLayout>
    );
  }

  // Once authenticated and authorized, proceed with data loading or error display for users
  if (loading && users.length === 0) {
    return (
      <PageLayout title="User Management">
        <div className="p-6 text-center text-muted-foreground">
          Loading users...
        </div>
      </PageLayout>
    );
  }

  if (error && users.length === 0) {
    return (
      <PageLayout title="User Management">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="User Management"
      action={
        <Button onClick={openCreateModal} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          New User
        </Button>
      }
    >
      {/* Statistics Section */}
      <PageSection title="Overview">
        <UserStats users={users} />
      </PageSection>

      {/* Users Table Section */}
      <PageSection title="All Users">
        <ContentCard isLoading={loading}>
          <UserTable
            users={users}
            loading={loading}
            onEdit={openEditModal}
            onDelete={handleDeleteClick}
            deletingUserId={deletingUserId}
          />
        </ContentCard>
      </PageSection>

      {/* New/Edit User Dialog */}
      <UserFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        editingUser={editingUser}
        onSubmit={editingUser ? handleEdit : handleCreate}
        onCancel={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
        loading={submitting}
      />

      {/* Confirmation Dialog for Delete User */}
      <UserDeleteConfirmationDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        user={userToDelete}
        onConfirm={confirmDelete}
        loading={!!deletingUserId}
      />
    </PageLayout>
  );
}
