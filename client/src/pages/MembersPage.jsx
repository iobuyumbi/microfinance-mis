import React, { useState } from "react";
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
} from "lucide-react";

const MembersPage = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Mock data - replace with actual API calls
  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1234567890",
      status: "active",
      role: "member",
      group: "Group A",
      joinDate: "2024-01-15",
      totalSavings: "$2,450",
      activeLoan: "$1,500",
      lastPayment: "2024-01-10",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1234567891",
      status: "active",
      role: "leader",
      group: "Group B",
      joinDate: "2024-01-10",
      totalSavings: "$3,200",
      activeLoan: "$0",
      lastPayment: "2024-01-12",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+1234567892",
      status: "pending",
      role: "member",
      group: "Group A",
      joinDate: "2024-01-20",
      totalSavings: "$500",
      activeLoan: "$0",
      lastPayment: "N/A",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+1234567893",
      status: "inactive",
      role: "member",
      group: "Group C",
      joinDate: "2023-12-01",
      totalSavings: "$1,800",
      activeLoan: "$2,000",
      lastPayment: "2023-12-15",
    },
  ];

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

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    const matchesFilter =
      filterStatus === "all" || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      title: "Total Members",
      value: members.length.toString(),
      change: "+5%",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Active Members",
      value: members.filter((m) => m.status === "active").length.toString(),
      change: "+12%",
      changeType: "positive",
      icon: UserCheck,
    },
    {
      title: "Group Leaders",
      value: members.filter((m) => m.role === "leader").length.toString(),
      change: "+3%",
      changeType: "positive",
      icon: Building2,
    },
    {
      title: "Pending Applications",
      value: members.filter((m) => m.status === "pending").length.toString(),
      change: "-2%",
      changeType: "negative",
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
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
          />
        ))}
      </div>

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
                {filteredMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {member.name.charAt(0)}
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
                        {member.group}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                        <PiggyBank className="mr-2 h-4 w-4" />
                        {member.totalSavings}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-orange-600 dark:text-orange-400 font-medium">
                        <DollarSign className="mr-2 h-4 w-4" />
                        {member.activeLoan === "$0"
                          ? "No loan"
                          : member.activeLoan}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="mr-2 h-4 w-4" />
                        {member.lastPayment}
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
                              <DropdownMenuItem asChild>
                                <Link to={`/members/${member.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Member
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Member
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
        <MemberForm />
      </FormModal>
    </div>
  );
};

export default MembersPage;
