import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { X, UserPlus } from "lucide-react";
import { memberService } from "../../services/memberService";
import { groupService } from "../../services/groupService";
import { toast } from "sonner";

const AddMemberToGroupModal = ({ isOpen, onClose, groupId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");

  // Fetch available members when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableMembers();
    }
  }, [isOpen]);

  const fetchAvailableMembers = async () => {
    try {
      const response = await memberService.getMembers();
      const list = response.data?.data || [];
      // Filter out members who are already in this group (support both _id and id keys)
      const availableMembers = list.filter((member) => {
        const memberships = member.groups || member.groupMemberships || [];
        return !memberships.some(
          (group) => (group._id || group.id) === groupId
        );
      });
      setMembers(availableMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load available members");
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      toast.error("Please select a member");
      return;
    }

    setLoading(true);
    try {
      await memberService.addMemberToGroup(
        selectedMemberId,
        groupId,
        selectedRole
      );
      toast.success("Member added to group successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding member to group:", error);
      toast.error(
        error.response?.data?.message || "Failed to add member to group"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Member to Group
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-muted transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription>
            Add an existing member to this group
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="member">Select Member</Label>
            <Select
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.length > 0 ? (
                  members.map((member) => (
                    <SelectItem
                      key={member._id || member.id}
                      value={(member._id || member.id).toString()}
                    >
                      {member.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-members" disabled>
                    No available members
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role">Role in Group</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="secretary">Secretary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={loading}>
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberToGroupModal;
