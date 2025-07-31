import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, MessageCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils";

const UserGroupPage = () => {
  const [groupInfo] = useState({
    name: "Nairobi Business Group",
    code: "NBG-001",
    leader: "John Doe",
    totalMembers: 15,
    activeMembers: 12,
    totalSavings: 450000,
    totalLoans: 800000,
    meetingDay: "Every Tuesday",
    meetingTime: "2:00 PM",
  });

  const [members] = useState([
    {
      id: "1",
      name: "John Doe",
      role: "leader",
      savings: 50000,
      loans: 100000,
      joinDate: "2023-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      role: "member",
      savings: 30000,
      loans: 75000,
      joinDate: "2023-02-20",
      status: "active",
    },
  ]);

  const getRoleBadge = (role) => {
    const colors = {
      leader: "bg-blue-100 text-blue-800",
      member: "bg-green-100 text-green-800",
    };
    return <Badge className={colors[role]}>{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Group</h1>
          <p className="text-muted-foreground">Group information and members</p>
        </div>
        <Button>
          <MessageCircle className="w-4 h-4 mr-2" />
          Group Chat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{groupInfo.name}</CardTitle>
          <CardDescription>Group Code: {groupInfo.code}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Leader</p>
              <p className="text-sm text-muted-foreground">
                {groupInfo.leader}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Members</p>
              <p className="text-sm text-muted-foreground">
                {groupInfo.activeMembers}/{groupInfo.totalMembers}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Savings</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(groupInfo.totalSavings)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Loans</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(groupInfo.totalLoans)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
          <CardDescription>All members in your group</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Loans</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>{formatCurrency(member.savings)}</TableCell>
                  <TableCell>{formatCurrency(member.loans)}</TableCell>
                  <TableCell>{formatDate(member.joinDate)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserGroupPage;
