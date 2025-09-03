import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Building2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const GroupForm = ({ onSubmit, onCancel, group }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    meetingFrequency: "",
    status: "active",
  });

  // Load initial data if provided (for edit mode)
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        description: group.description || "",
        location: group.location || "",
        meetingFrequency: group.meetingFrequency || "",
        status: group.status || "active",
      });
    }
  }, [group]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name) {
      toast.error("Group name is required");
      return;
    }
    
    if (!formData.location) {
      toast.error("Group location is required");
      return;
    }
    
    setLoading(true);

    try {
      // Use the onSubmit prop to handle form submission
      await onSubmit(formData);
      
      // Only reset form if not in edit mode
      if (!group) {
        setFormData({ 
          name: "", 
          description: "", 
          location: "",
          meetingFrequency: "",
          status: "active",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error saving group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Group Name</Label>
        <Input
          id="name"
          placeholder="e.g., Unity Savings Group"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Briefly describe the group's purpose"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., Nairobi, Kenya"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meetingFrequency">Meeting Schedule</Label>
          <Input
            id="meetingFrequency"
            placeholder="e.g., Every Tuesday, 4:00 PM"
            value={formData.meetingFrequency}
            onChange={(e) => handleChange("meetingFrequency", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
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
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {group ? "Updating..." : "Creating..."}
            </>
          ) : (
            group ? "Update Group" : "Create Group"
          )}
        </Button>
      </div>
    </form>
  );
};

export default GroupForm;
