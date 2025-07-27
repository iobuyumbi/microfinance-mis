import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building, Users, MapPin, Calendar } from "lucide-react";

export default function GroupForm({
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    meetingFrequency: "monthly",
  });
  const [errors, setErrors] = useState({});

  // Initialize form with initial values
  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || "",
        location: initialValues.location || "",
        meetingFrequency: initialValues.meetingFrequency || "monthly",
      });
    }
  }, [initialValues]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const meetingFrequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Group Name *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter group name"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location *
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          placeholder="Enter meeting location"
          className={errors.location ? "border-red-500" : ""}
        />
        {errors.location && (
          <p className="text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      {/* Meeting Frequency */}
      <div className="space-y-2">
        <Label htmlFor="meetingFrequency" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Meeting Frequency
        </Label>
        <Select
          value={formData.meetingFrequency}
          onValueChange={(value) =>
            handleInputChange("meetingFrequency", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select meeting frequency" />
          </SelectTrigger>
          <SelectContent>
            {meetingFrequencies.map((frequency) => (
              <SelectItem key={frequency.value} value={frequency.value}>
                {frequency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialValues._id ? "Update Group" : "Create Group"}
        </Button>
      </div>
    </form>
  );
}
