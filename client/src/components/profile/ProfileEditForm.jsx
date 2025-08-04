import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    nationalID: user?.nationalID || "",
    gender: user?.gender || "",
    address: user?.address || "",
    dateOfBirth: user?.dateOfBirth || "",
    occupation: user?.occupation || "",
    monthlyIncome: user?.monthlyIncome || "",
    educationLevel: user?.educationLevel || "",
    maritalStatus: user?.maritalStatus || "",
    dependents: user?.dependents || "",
    emergencyContact: user?.emergencyContact || "",
    bankName: user?.bankName || "",
    bankAccountNumber: user?.bankAccountNumber || "",
    nextOfKin: user?.nextOfKin || "",
    nextOfKinPhone: user?.nextOfKinPhone || "",
    nextOfKinRelationship: user?.nextOfKinRelationship || "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user?.email || ""}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+1234567890"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationalID">National ID</Label>
          <Input
            id="nationalID"
            value={formData.nationalID}
            onChange={(e) => handleInputChange("nationalID", e.target.value)}
            placeholder="Enter your national ID"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleInputChange("gender", value)}
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
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => handleInputChange("occupation", e.target.value)}
            placeholder="Enter your occupation"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyIncome">Monthly Income</Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
            placeholder="Enter monthly income"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="educationLevel">Education Level</Label>
          <Select
            value={formData.educationLevel}
            onValueChange={(value) =>
              handleInputChange("educationLevel", value)
            }
          >
            <SelectTrigger id="educationLevel">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="diploma">Diploma</SelectItem>
              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="master">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select
            value={formData.maritalStatus}
            onValueChange={(value) => handleInputChange("maritalStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dependents">Number of Dependents</Label>
          <Input
            id="dependents"
            type="number"
            value={formData.dependents}
            onChange={(e) => handleInputChange("dependents", e.target.value)}
            placeholder="Number of dependents"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) =>
              handleInputChange("emergencyContact", e.target.value)
            }
            placeholder="Emergency contact number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name</Label>
          <Input
            id="bankName"
            value={formData.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            placeholder="Enter bank name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
          <Input
            id="bankAccountNumber"
            value={formData.bankAccountNumber}
            onChange={(e) =>
              handleInputChange("bankAccountNumber", e.target.value)
            }
            placeholder="Enter account number"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter your full address"
            rows={3}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">
            Next of Kin Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nextOfKin">Next of Kin Name</Label>
              <Input
                id="nextOfKin"
                value={formData.nextOfKin}
                onChange={(e) => handleInputChange("nextOfKin", e.target.value)}
                placeholder="Enter next of kin name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOfKinPhone">Next of Kin Phone</Label>
              <Input
                id="nextOfKinPhone"
                value={formData.nextOfKinPhone}
                onChange={(e) =>
                  handleInputChange("nextOfKinPhone", e.target.value)
                }
                placeholder="Enter next of kin phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOfKinRelationship">Relationship</Label>
              <Select
                value={formData.nextOfKinRelationship}
                onValueChange={(value) =>
                  handleInputChange("nextOfKinRelationship", value)
                }
              >
                <SelectTrigger id="nextOfKinRelationship">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
