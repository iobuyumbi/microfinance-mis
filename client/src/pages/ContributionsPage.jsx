import React, { useEffect, useState } from "react";
import {
  FacebookCard,
  FacebookCardContent,
  FacebookCardHeader,
} from "../components/ui/facebook-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Download,
  Filter,
  TrendingUp,
  Calendar,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { contributionService } from "../services/contributionService";
import { groupService } from "../services/groupService";
import { userService } from "../services/userService";

const ContributionsPage = () => {
  const [contributions, setContributions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedMember, setSelectedMember] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalAmount: 0,
    averageContribution: 0,
    activeContributors: 0,
  });

  const [newContribution, setNewContribution] = useState({
    memberId: "",
    groupId: "",
    amount: "",
    description: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    fetchContributions();
    fetchGroups();
    fetchMembers();
  }, [selectedGroup, selectedMember, dateRange]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGroup && selectedGroup !== "all")
        params.groupId = selectedGroup;
      if (selectedMember && selectedMember !== "all")
        params.memberId = selectedMember;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      if (searchTerm) params.search = searchTerm;

      const response = await contributionService.getAll(params);
      setContributions(response.data.data || []);
      calculateStats(response.data.data || []);
    } catch (error) {
      console.error("Error fetching contributions:", error);
      toast.error("Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await groupService.getAll();
      setGroups(response.data.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await userService.getAll();
      setMembers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const calculateStats = (data) => {
    const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0);
    const uniqueMembers = new Set(data.map((item) => item.member?._id)).size;

    setStats({
      totalContributions: data.length,
      totalAmount,
      averageContribution: data.length > 0 ? totalAmount / data.length : 0,
      activeContributors: uniqueMembers,
    });
  };

  const handleCreateContribution = async (e) => {
    e.preventDefault();
    if (
      !newContribution.memberId ||
      !newContribution.groupId ||
      !newContribution.amount
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await contributionService.create(newContribution);
      toast.success("Contribution recorded successfully");
      setIsAddOpen(false);
      setNewContribution({
        memberId: "",
        groupId: "",
        amount: "",
        description: "",
        paymentMethod: "cash",
      });
      fetchContributions();
    } catch (error) {
      console.error("Error creating contribution:", error);
      toast.error(
        error.response?.data?.message || "Failed to record contribution"
      );
    }
  };

  const exportContributions = async () => {
    try {
      const params = {};
      if (selectedGroup && selectedGroup !== "all")
        params.groupId = selectedGroup;
      if (selectedMember && selectedMember !== "all")
        params.memberId = selectedMember;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const response = await contributionService.export(params);

      // Create and download file
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contributions-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Contributions exported successfully");
    } catch (error) {
      console.error("Error exporting contributions:", error);
      toast.error("Failed to export contributions");
    }
  };

  const getMemberName = (memberId) => {
    const member = members.find((m) => m._id === memberId);
    return member ? member.name : "Unknown Member";
  };

  const getGroupName = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    return group ? group.name : "Unknown Group";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Contributions Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage member contributions across all groups
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportContributions}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Contribution
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <FacebookCard>
          <FacebookCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </p>
                <p className="text-2xl font-bold">
                  ${stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </FacebookCardContent>
        </FacebookCard>

        <FacebookCard>
          <FacebookCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Contributions
                </p>
                <p className="text-2xl font-bold">{stats.totalContributions}</p>
              </div>
            </div>
          </FacebookCardContent>
        </FacebookCard>

        <FacebookCard>
          <FacebookCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Contributors
                </p>
                <p className="text-2xl font-bold">{stats.activeContributors}</p>
              </div>
            </div>
          </FacebookCardContent>
        </FacebookCard>

        <FacebookCard>
          <FacebookCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Contribution
                </p>
                <p className="text-2xl font-bold">
                  ${stats.averageContribution.toFixed(2)}
                </p>
              </div>
            </div>
          </FacebookCardContent>
        </FacebookCard>
      </div>

      {/* Filters */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label>Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search contributions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Contributions Table */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Contributions History</h2>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="overflow-hidden rounded-lg border-2 border-blue-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      Loading contributions...
                    </TableCell>
                  </TableRow>
                ) : contributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      No contributions found
                    </TableCell>
                  </TableRow>
                ) : (
                  contributions.map((contribution) => (
                    <TableRow key={contribution._id}>
                      <TableCell>
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {contribution.member?.name ||
                          getMemberName(contribution.member)}
                      </TableCell>
                      <TableCell>
                        {contribution.group?.name ||
                          getGroupName(contribution.group)}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${contribution.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {contribution.paymentMethod || "cash"}
                      </TableCell>
                      <TableCell>
                        {contribution.description || "Contribution"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            contribution.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {contribution.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Add Contribution Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Contribution</DialogTitle>
            <DialogDescription>
              Record a new contribution from a member to their group.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateContribution} className="space-y-4">
            <div>
              <Label htmlFor="memberId">Member *</Label>
              <Select
                value={newContribution.memberId}
                onValueChange={(value) =>
                  setNewContribution({ ...newContribution, memberId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="groupId">Group *</Label>
              <Select
                value={newContribution.groupId}
                onValueChange={(value) =>
                  setNewContribution({ ...newContribution, groupId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={newContribution.amount}
                onChange={(e) =>
                  setNewContribution({
                    ...newContribution,
                    amount: e.target.value,
                  })
                }
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={newContribution.paymentMethod}
                onValueChange={(value) =>
                  setNewContribution({
                    ...newContribution,
                    paymentMethod: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile">Mobile Money</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newContribution.description}
                onChange={(e) =>
                  setNewContribution({
                    ...newContribution,
                    description: e.target.value,
                  })
                }
                placeholder="Optional description"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Record Contribution
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContributionsPage;
