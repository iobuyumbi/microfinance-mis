// src/pages/MyGroups.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { groupService } from "@/services/groupService";
import { userService } from "@/services/userService";
import { meetingService } from "@/services/meetingService";
import { savingsService } from "@/services/savingsService";
import { loanService } from "@/services/loanService";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Custom Components
import { PageLayout, ContentCard } from "@/components/layouts/PageLayout";
import { DataTable } from "@/components/custom/DataTable";
import { UserAvatar } from "@/components/custom/UserAvatar";
import { StatsCard } from "@/components/custom/StatsCard";
import GroupMemberManagement from "@/components/custom/GroupMemberManagement";

// Lucide React Icons
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Settings,
  Shield,
  Activity,
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

export default function MyGroups() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMeetings, setGroupMeetings] = useState([]);
  const [groupSavings, setGroupSavings] = useState([]);
  const [groupLoans, setGroupLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for join/add group functionality
  const [showJoinGroupDialog, setShowJoinGroupDialog] = useState(false);
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [joinGroupForm, setJoinGroupForm] = useState({ groupId: "" });
  const [addGroupForm, setAddGroupForm] = useState({
    name: "",
    location: "",
    meetingFrequency: "monthly",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserGroups();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetails(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getUserGroups(
        currentUser._id || currentUser.id
      );
      const userGroups = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setGroups(userGroups);

      if (userGroups.length > 0) {
        setSelectedGroup(userGroups[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to load groups");
      toast.error(err.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (group) => {
    try {
      // Fetch group members
      const membersResponse = await userService.getGroupMembers(
        group._id || group.id
      );
      // setGroupMembers( // This state is no longer needed
      //   Array.isArray(membersResponse.data) ? membersResponse.data : []
      // );

      // Fetch group meetings
      const meetingsResponse = await meetingService.getGroupMeetings(
        group._id || group.id
      );
      setGroupMeetings(
        Array.isArray(meetingsResponse.data) ? meetingsResponse.data : []
      );

      // Fetch group savings
      const savingsResponse = await savingsService.getGroupSavings(
        group._id || group.id
      );
      setGroupSavings(
        Array.isArray(savingsResponse.data) ? savingsResponse.data : []
      );

      // Fetch group loans
      const loansResponse = await loanService.getGroupLoans(
        group._id || group.id
      );
      setGroupLoans(
        Array.isArray(loansResponse.data) ? loansResponse.data : []
      );
    } catch (err) {
      toast.error("Failed to load group details");
    }
  };

  // New functions for join/add group functionality
  const fetchAvailableGroups = async () => {
    try {
      const response = await groupService.getAll();
      const allGroups = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      // Filter out groups the user is already a member of
      const userGroupIds = groups.map((g) => g._id || g.id);
      const available = allGroups.filter(
        (g) => !userGroupIds.includes(g._id || g.id)
      );
      setAvailableGroups(available);
    } catch (err) {
      console.error("Failed to fetch available groups:", err);
      setAvailableGroups([]);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinGroupForm.groupId) {
      toast.error("Please select a group to join");
      return;
    }

    setSubmitting(true);
    try {
      await groupService.joinGroup(joinGroupForm.groupId);
      toast.success("Successfully joined the group!");
      setShowJoinGroupDialog(false);
      setJoinGroupForm({ groupId: "" });
      fetchUserGroups(); // Refresh user's groups
    } catch (err) {
      toast.error(err.message || "Failed to join group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddGroup = async () => {
    if (!addGroupForm.name || !addGroupForm.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await groupService.create(addGroupForm);
      toast.success("Group created successfully!");
      setShowAddGroupDialog(false);
      setAddGroupForm({
        name: "",
        location: "",
        meetingFrequency: "monthly",
      });
      fetchUserGroups(); // Refresh user's groups
    } catch (err) {
      toast.error(err.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculations
  // const totalMembers = groupMembers.length; // This state is no longer needed
  // const activeMembers = groupMembers.filter( // This state is no longer needed
  //   (m) => m.status === "active"
  // ).length;
  const totalSavings = groupSavings.reduce(
    (sum, saving) => sum + (saving.amount || 0),
    0
  );
  const activeLoans = groupLoans.filter(
    (loan) => loan.status === "active"
  ).length;

  // Member management columns for leaders
  // const memberColumns = [ // This state is no longer needed
  //   {
  //     accessorKey: "name",
  //     header: "Member",
  //     cell: ({ row }) => (
  //       <div className="flex items-center space-x-3">
  //         <UserAvatar user={row.original} size="sm" />
  //         <div>
  //           <div className="font-medium">{row.original.name}</div>
  //           <div className="text-sm text-muted-foreground">
  //             {row.original.email}
  //           </div>
  //         </div>
  //       </div>
  //     ),
  //   },
  //   {
  //     accessorKey: "groupRole",
  //     header: "Group Role",
  //     cell: ({ row }) => (
  //       <Badge variant="outline" className="capitalize">
  //         {row.original.groupRole || "Member"}
  //       </Badge>
  //     ),
  //   },
  //   {
  //     accessorKey: "status",
  //     header: "Status",
  //     cell: ({ row }) => (
  //       <Badge
  //         variant={row.original.status === "active" ? "default" : "secondary"}
  //         className="capitalize"
  //       >
  //         {row.original.status}
  //       </Badge>
  //     ),
  //   },
  //   ...(currentUser.role === "leader"
  //     ? [
  //         {
  //           id: "actions",
  //           header: "Actions",
  //           cell: ({ row }) => (
  //             <div className="flex space-x-2">
  //               <Button
  //                 variant="outline"
  //                 size="sm"
  //                 onClick={() => {
  //                   setSelectedMember(row.original);
  //                   setShowRoleDialog(true);
  //                 }}
  //               >
  //                 <Settings className="h-4 w-4" />
  //               </Button>
  //             </div>
  //           ),
  //         },
  //       ]
  //     : []),
  // ];

  // Meeting columns
  const meetingColumns = [
    {
      accessorKey: "title",
      header: "Meeting",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.description}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          {new Date(row.original.date).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "completed" ? "default" : "secondary"
          }
          className="capitalize"
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <PageLayout title="My Groups">
        <div className="p-6 text-center text-muted-foreground">
          Loading your groups...
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="My Groups">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  if (groups.length === 0) {
    return (
      <PageLayout title="My Groups">
        <div className="p-6 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-6">You are not a member of any groups yet.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                fetchAvailableGroups();
                setShowJoinGroupDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Join Existing Group
            </Button>

            {(currentUser.role === "leader" ||
              currentUser.role === "admin" ||
              currentUser.role === "officer") && (
              <Button
                variant="outline"
                onClick={() => setShowAddGroupDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Group
              </Button>
            )}
          </div>
        </div>

        {/* Join Group Dialog */}
        <Dialog
          open={showJoinGroupDialog}
          onOpenChange={setShowJoinGroupDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-select">Select Group</Label>
                <Select
                  value={joinGroupForm.groupId}
                  onValueChange={(value) =>
                    setJoinGroupForm({ groupId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a group to join" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroups.map((group) => (
                      <SelectItem
                        key={group._id || group.id}
                        value={group._id || group.id}
                      >
                        {group.name} - {group.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowJoinGroupDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleJoinGroup} disabled={submitting}>
                {submitting ? "Joining..." : "Join Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Group Dialog */}
        <Dialog open={showAddGroupDialog} onOpenChange={setShowAddGroupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={addGroupForm.name}
                  onChange={(e) =>
                    setAddGroupForm({ ...addGroupForm, name: e.target.value })
                  }
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Label htmlFor="group-location">Location</Label>
                <Input
                  id="group-location"
                  value={addGroupForm.location}
                  onChange={(e) =>
                    setAddGroupForm({
                      ...addGroupForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="Enter group location"
                />
              </div>
              <div>
                <Label htmlFor="meeting-frequency">Meeting Frequency</Label>
                <Select
                  value={addGroupForm.meetingFrequency}
                  onValueChange={(value) =>
                    setAddGroupForm({
                      ...addGroupForm,
                      meetingFrequency: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddGroupDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddGroup} disabled={submitting}>
                {submitting ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="My Groups"
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchAvailableGroups();
              setShowJoinGroupDialog(true);
            }}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Join Group
          </Button>

          {(currentUser.role === "leader" ||
            currentUser.role === "admin" ||
            currentUser.role === "officer") && (
            <Button
              onClick={() => setShowAddGroupDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          )}
        </div>
      }
    >
      {/* Group Selection */}
      <div className="mb-6">
        <Label htmlFor="group-select">Select Group</Label>
        <Select
          value={selectedGroup?._id || selectedGroup?.id}
          onValueChange={(value) => {
            const group = groups.find((g) => (g._id || g.id) === value);
            setSelectedGroup(group);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem
                key={group._id || group.id}
                value={group._id || group.id}
              >
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGroup && (
        <>
          {/* Group Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* <StatsCard // This state is no longer needed
              title="Total Members"
              value={totalMembers}
              description="Group members"
              icon={Users}
            /> */}
            {/* <StatsCard // This state is no longer needed
              title="Active Members"
              value={activeMembers}
              description="Currently active"
              icon={Activity}
              className="border-green-200 bg-green-50/50"
            /> */}
            <StatsCard
              title="Total Savings"
              value={`$${totalSavings.toLocaleString()}`}
              description="Group savings"
              icon={DollarSign}
              className="border-blue-200 bg-blue-50/50"
            />
            <StatsCard
              title="Active Loans"
              value={activeLoans}
              description="Current loans"
              icon={TrendingUp}
              className="border-orange-200 bg-orange-50/50"
            />
          </div>

          {/* Group Details Tabs */}
          <Tabs defaultValue="members" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <GroupMemberManagement
                groupId={selectedGroup._id || selectedGroup.id}
                onMemberUpdate={fetchGroupDetails}
              />
            </TabsContent>

            <TabsContent value="meetings" className="space-y-4">
              <ContentCard title="Group Meetings">
                <DataTable
                  columns={meetingColumns}
                  data={groupMeetings}
                  searchKey="title"
                  searchPlaceholder="Search meetings..."
                />
              </ContentCard>
            </TabsContent>

            <TabsContent value="savings" className="space-y-4">
              <ContentCard title="Group Savings">
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Savings details coming soon...</p>
                </div>
              </ContentCard>
            </TabsContent>

            <TabsContent value="loans" className="space-y-4">
              <ContentCard title="Group Loans">
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Loan details coming soon...</p>
                </div>
              </ContentCard>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Member Role Management Dialog (Leader Only) */}
      {/* This dialog is no longer needed as member management is handled by GroupMemberManagement */}
      {/* {currentUser.role === "leader" && (
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Member Role</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div>
                  <Label>Member</Label>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <UserAvatar user={selectedMember} size="sm" />
                    <div>
                      <div className="font-medium">{selectedMember.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedMember.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Group Role</Label>
                  <Select
                    value={selectedMember.groupRole || "member"}
                    onValueChange={(value) =>
                      handleMemberRoleChange(
                        selectedMember._id || selectedMember.id,
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="vice-leader">Vice Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedMember.status}
                    onValueChange={(value) =>
                      handleMemberStatusChange(
                        selectedMember._id || selectedMember.id,
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )} */}

      {/* Join Group Dialog */}
      <Dialog open={showJoinGroupDialog} onOpenChange={setShowJoinGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-select">Select Group</Label>
              <Select
                value={joinGroupForm.groupId}
                onValueChange={(value) => setJoinGroupForm({ groupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group to join" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map((group) => (
                    <SelectItem
                      key={group._id || group.id}
                      value={group._id || group.id}
                    >
                      {group.name} - {group.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowJoinGroupDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleJoinGroup} disabled={submitting}>
              {submitting ? "Joining..." : "Join Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={showAddGroupDialog} onOpenChange={setShowAddGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={addGroupForm.name}
                onChange={(e) =>
                  setAddGroupForm({ ...addGroupForm, name: e.target.value })
                }
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="group-location">Location</Label>
              <Input
                id="group-location"
                value={addGroupForm.location}
                onChange={(e) =>
                  setAddGroupForm({ ...addGroupForm, location: e.target.value })
                }
                placeholder="Enter group location"
              />
            </div>
            <div>
              <Label htmlFor="meeting-frequency">Meeting Frequency</Label>
              <Select
                value={addGroupForm.meetingFrequency}
                onValueChange={(value) =>
                  setAddGroupForm({ ...addGroupForm, meetingFrequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddGroupDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddGroup} disabled={submitting}>
              {submitting ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
