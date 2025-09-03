import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Building2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { userService } from "../../services/userService";

const GroupForm = ({ onSubmit, onCancel, group }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    meetingFrequency: "",
    status: "active",
    leaderId: "",
  });

  // Load available users for leader selection
  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log("Loading users for leader selection...");
        const response = await userService.getAll();
        console.log("User service response:", response);
        
        const usersData = response.data?.data || [];
        console.log("Users data:", usersData);
        
        // Filter to only include users who can be leaders (user, member, leader, officer, admin)
        // Note: 'user' is the default role, so we include it as well
        const eligibleUsers = usersData.filter(user => 
          ['user', 'member', 'leader', 'officer', 'admin'].includes(user.role)
        );
        console.log("Eligible users:", eligibleUsers);
        
        setUsers(eligibleUsers);
        
        if (eligibleUsers.length === 0) {
          toast.warning("No users found in the system. Please create users first before creating groups.");
        } else {
          console.log(`Found ${eligibleUsers.length} eligible users for group leadership`);
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load users for leader selection: " + error.message);
      }
    };
    
    loadUsers();
  }, []);

  // Load initial data if provided (for edit mode)
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        description: group.description || "",
        location: group.location || "",
        meetingFrequency: group.meetingFrequency || "",
        status: group.status || "active",
        leaderId: group.leader?._id || group.leader || "",
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

    if (!formData.leaderId) {
      toast.error("Group leader is required");
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
          leaderId: "",
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="leaderId">Group Leader</Label>
          <Select 
            value={formData.leaderId} 
            onValueChange={(value) => handleChange("leaderId", value)}
            disabled={users.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={users.length === 0 ? "No eligible users available" : "Select a group leader"} />
            </SelectTrigger>
            <SelectContent>
              {users.length === 0 ? (
                <SelectItem value="" disabled>
                  No eligible users found
                </SelectItem>
              ) : (
                users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {users.length === 0 && (
            <p className="text-sm text-amber-600">
              No users available for group leadership. Please create users with member, leader, officer, or admin roles first.
            </p>
          )}
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
