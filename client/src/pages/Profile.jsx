// src/pages/Profile.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService"; // Ensure this path is correct

// Shadcn UI Components
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
} from "@/components/ui"; // Correct path for Shadcn UI components
import { PageLayout, ContentCard } from "@/components/layouts/PageLayout"; // Import PageLayout and ContentCard
import { toast } from "sonner";

// Lucide React Icons
import UserAvatar from "@/components/custom/UserAvatar"; // Assuming this component is available
import {
  Mail,
  Phone,
  User as UserIcon, // Renamed to avoid conflict with component name
  Edit,
  Save,
  XCircle,
  Loader2,
  Shield, // For role display
} from "lucide-react";

export default function Profile() {
  const {
    user: currentUser,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  }); // Include role in formData
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Effect to initialize or update formData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        role: currentUser.role || "", // Set role from currentUser
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      // Only send editable fields. Role is typically not updated by the user themselves.
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };
      await userService.update(currentUser._id || currentUser.id, updateData);
      toast.success("Profile updated successfully.");
      setEditing(false);
      // Re-fetch user data if necessary to ensure AuthContext is updated
      // If useAuth context automatically refreshes user on update, this might not be needed.
      // For now, assume a refresh is triggered by the backend or context.
    } catch (err) {
      const errorMessage = err.message || "Failed to update profile.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Revert formData to current user's data
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        role: currentUser.role || "",
      });
    }
    setError("");
  };

  // Render loading and access denied states
  if (authLoading) {
    return (
      <PageLayout title="User Profile">
        <div className="p-6 text-center text-muted-foreground">
          Loading profile...
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <PageLayout title="User Profile">
        <div className="p-6 text-center text-red-500">
          <UserIcon className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: Please log in to view your profile.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="User Profile" className="max-w-xl mx-auto">
      <ContentCard className="shadow-lg border-0">
        <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg pb-8">
          <UserAvatar
            user={currentUser}
            size="xl"
            showBadge
            showStatus
            className="mb-2 shadow-lg"
          />
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <UserIcon className="w-6 h-6 mr-1 text-white/80" />
            {currentUser.name}
          </CardTitle>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1 text-white/90">
              <Mail className="w-4 h-4" /> {currentUser.email}
            </span>
            <span className="flex items-center gap-1 text-white/90">
              <Phone className="w-4 h-4" /> {currentUser.phone || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
            <Shield className="w-4 h-4" /> Role:{" "}
            <span className="font-semibold capitalize">{currentUser.role}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" /> Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                disabled={!editing || saving}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled={!editing || saving}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> Phone
              </Label>
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                disabled={!editing || saving}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            {/* Role is displayed but not editable by the user directly */}
            <div>
              <Label htmlFor="role" className="flex items-center gap-1">
                <Shield className="h-4 w-4" /> Role
              </Label>
              <Input
                id="role"
                type="text"
                value={
                  formData.role
                    ? formData.role.charAt(0).toUpperCase() +
                      formData.role.slice(1)
                    : ""
                }
                disabled // Role is not editable by user
              />
            </div>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

            <div className="flex space-x-3 mt-4">
              {editing ? (
                <>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)} disabled={saving}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </ContentCard>
    </PageLayout>
  );
}
