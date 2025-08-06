// client/src/pages/DynamicMembersPage.jsx
import React, { useEffect, useState } from "react";
import { memberService } from "@/services/memberService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  User,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  Shield,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MemberForm from "@/components/forms/MemberForm";
import { toast } from "sonner";

const DynamicMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getAllMembers();
      setMembers(response.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load members");
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateMember = async (formData) => {
    try {
      setFormLoading(true);
      await memberService.createMember(formData);
      toast.success("Member created successfully!");
      setShowForm(false);
      fetchMembers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create member");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMember = async (formData) => {
    try {
      setFormLoading(true);
      await memberService.updateMember(editingMember._id, formData);
      toast.success("Member updated successfully!");
      setShowForm(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update member");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      await memberService.deleteMember(memberId);
      toast.success("Member deleted successfully!");
      fetchMembers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete member");
    }
  };

  const openEditForm = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "officer":
        return "bg-blue-100 text-blue-800";
      case "leader":
        return "bg-green-100 text-green-800";
      case "member":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Manage your microfinance members</p>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Member" : "Add New Member"}
              </DialogTitle>
            </DialogHeader>
            <MemberForm
              initialData={editingMember}
              onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
              onCancel={closeForm}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No members found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first member
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card
              key={member._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                      {member.name}
                    </CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>ID: {member.nationalID}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      /* TODO: Navigate to member details */
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(member)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMember(member._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicMembersPage;
