import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StatsCard } from "../components/ui/stats-card";
import {
  FacebookCard,
  FacebookCardHeader,
  FacebookCardContent,
} from "../components/ui/facebook-card";
import { Badge } from "../components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import FormModal from "../components/modals/FormModal";
import MemberForm from "../components/forms/MemberForm";
import { memberService } from "../services/memberService";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  DollarSign,
  PiggyBank,
  Calendar,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Clock,
  Loader2,
} from "lucide-react";

const MembersPage = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    inactiveMembers: 0,
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);

  /**
   * Fetch members and stats from API on component mount
   */
  useEffect(() => {
    fetchMembers();
    fetchMemberStats();
  }, []);

  /**
   * Fetch members from the API with optional search and filter parameters
   * @async
   */
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getMembers({
        status: filterStatus !== "all" ? filterStatus : undefined,
        search: searchTerm || undefined,
      });
      setMembers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch member statistics from the API
   * @async
   */
  const fetchMemberStats = async () => {
    try {
      const response = await memberService.getMemberStats();
      setStats(
        response?.data || {
          totalMembers: 0,
          activeMembers: 0,
          pendingMembers: 0,
          inactiveMembers: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching member stats:", error);
    }
  };

  /**
   * Get appropriate badge styling based on member status
   * @param {string} status - The member status
   * @returns {JSX.Element} Badge component with appropriate styling
   */
  const getStatusBadge = (status) => {
    const variants = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
    return (
      <Badge
        className={
          variants[status] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
      >
        {status}
      </Badge>
    );
  };

  /**
   * Get appropriate badge styling based on member role
   * @param {string} role - The member role
   * @returns {JSX.Element} Badge component with appropriate styling
   */
  const getRoleBadge = (role) => {
    const variants = {
      member:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      leader:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      admin: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
    return (
      <Badge
        className={
          variants[role] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
      >
        {role}
      </Badge>
    );
  };

  /**
   * Handle search and filter with debounce
   * Fetches members when search term or filter status changes after a 500ms delay
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  /**
   * Handle member creation
   * @async
   * @param {Object} memberData - The member data to be submitted
   */
  const handleCreateMember = async (memberData) => {
    try {
      await memberService.createMember(memberData);
      toast.success("Member created successfully");
      setIsAddMemberOpen(false);
      fetchMembers();
      fetchMemberStats();
    } catch (error) {
      console.error("Error creating member:", error);
      toast.error("Failed to create member");
    }
  };

  /**
   * Handle member update
   * @async
   * @param {Object} memberData - The updated member data
   */
  const handleUpdateMember = async (memberData) => {
    try {
      await memberService.updateMember(selectedMember.id, memberData);
      toast.success("Member updated successfully");
      setIsEditMemberOpen(false);
      fetchMembers();
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update member");
    }
  };

  /**
   * Handle member deletion with confirmation
   * @async
   * @param {string|number} id - The ID of the member to delete
   */
  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await memberService.deleteMember(id);
        toast.success("Member deleted successfully");
        fetchMembers();
        fetchMemberStats();
      } catch (error) {
        console.error("Error deleting member:", error);
        toast.error("Failed to delete member");
      }
    }
  };

  const statsData = [
    {
      title: "Total Members",
      value: String(stats.totalMembers ?? 0),
      icon: Users,
    },
    {
      title: "Active Members",
      value: String(stats.activeMembers ?? 0),
      icon: UserCheck,
    },
    {
      title: "Group Leaders",
      value: String(members.filter((m) => m.role === "leader").length ?? 0),
      icon: Building2,
    },
    {
      title: "Pending Applications",
      value: String(stats.pendingMembers ?? 0),
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage microfinance members and their information
          </p>
        </div>
        {hasRole(["admin", "officer"]) && (
          <Button
            onClick={() => setIsAddMemberOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading members...</span>
        </div>
      )}

      {/* Search and Filters */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Member Directory
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Search and filter members by various criteria
              </p>
            </div>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search members by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 px-4">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                  Active Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                  Pending Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>
                  Inactive Members
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Members Table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Member
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Contact
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Group
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Savings
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Loan
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">
                    Last Payment
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900 dark:text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No members found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || filterStatus !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "Get started by adding your first member"}
                        </p>
                        {hasRole(["admin", "officer"]) && (
                          <Button onClick={() => setIsAddMemberOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Member
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow
                      key={member.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {member.name ? member.name.charAt(0) : ""}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                            <div className="mt-1">
                              {getRoleBadge(member.role)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Mail className="mr-2 h-3 w-3 text-gray-400" />
                            {member.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="mr-2 h-3 w-3 text-gray-400" />
                            {member.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-900 dark:text-white">
                          <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                          {member.group?.name || "No Group"}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                          <PiggyBank className="mr-2 h-4 w-4" />$
                          {member.totalSavings?.toFixed(2) || "0.00"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-orange-600 dark:text-orange-400 font-medium">
                          <DollarSign className="mr-2 h-4 w-4" />
                          {member.activeLoanAmount > 0
                            ? `$${member.activeLoanAmount.toFixed(2)}`
                            : "No loan"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="mr-2 h-4 w-4" />
                          {member.lastPaymentDate
                            ? new Date(
                                member.lastPaymentDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/members/${member.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {hasRole(["admin", "officer"]) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsEditMemberOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Member
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Add Member Modal */}
      <FormModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Member"
      >
        <MemberForm onSubmit={handleCreateMember} />
      </FormModal>

      {/* Edit Member Modal */}
      <FormModal
        isOpen={isEditMemberOpen}
        onClose={() => setIsEditMemberOpen(false)}
        title="Edit Member"
      >
        {selectedMember && (
          <MemberForm
            onSubmit={handleUpdateMember}
            initialData={{
              id: selectedMember.id,
              name: selectedMember.name,
              email: selectedMember.email,
              phone: selectedMember.phone,
              gender: selectedMember.gender,
              address: selectedMember.address,
              nationalID: selectedMember.nationalID,
              status: selectedMember.status,
            }}
          />
        )}
      </FormModal>
    </div>
  );
};

export default MembersPage;
