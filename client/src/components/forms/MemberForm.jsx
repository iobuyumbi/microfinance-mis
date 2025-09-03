import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

const MemberForm = ({ initialData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    phone: initialData?.phone || "",
    gender: initialData?.gender || "",
    address: initialData?.address || "",
    nationalID: initialData?.nationalID || "",
    status: initialData?.status || "active",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      if (!initialData) {
        // Reset form only for new member creation
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          gender: "",
          address: "",
          nationalID: "",
          status: "active",
        });
      }
    } catch (error) {
      toast.error("Error saving member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {initialData ? "Edit Member" : "Register Member"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nationalID">National ID</Label>
            <Input
              id="nationalID"
              placeholder="Enter national ID"
              value={formData.nationalID}
              onChange={(e) => handleChange("nationalID", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {initialData && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onCancel?.(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {loading
                ? "Saving..."
                : initialData
                ? "Update Member"
                : "Register Member"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberForm;
