// client/src/pages/user/MembersPage.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Handshake, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const UserMembersPage = () => {
  const { user } = useAuth(); // Use useAuth hook for user data

  // Mock data for user's group members (replace with actual data fetching)
  const groupMembers = [
    { id: 1, name: "John Doe", role: "Member", status: "Active" },
    { id: 2, name: "Jane Smith", role: "Leader", status: "Active" },
    { id: 3, name: "Peter Jones", role: "Member", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Group Members</h1>
        <p className="text-gray-600">
          View details of your group members and group activities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Group
            </CardTitle>
            <CardDescription>
              Overview of your microfinance group.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              This section provides information about your current group,
              including its members and overall status.
            </p>
            <ul className="mt-2 text-gray-500 list-disc list-inside space-y-1">
              <li>Group Name: **Unity Savers**</li>
              <li>Group Leader: **Jane Smith**</li>
              <li>Total Members: **{groupMembers.length}**</li>
              <li>Next Meeting: **2024-03-10**</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Member Directory
            </CardTitle>
            <CardDescription>Browse members of your group.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {groupMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-md bg-gray-50"
                >
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              You can connect with your group members for support and
              collaboration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserMembersPage;
