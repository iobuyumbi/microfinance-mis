import React from "react";
import { StatsGrid } from "@/components/layouts/PageLayout";
import { StatsCard } from "@/components/custom/StatsCard";
import { Users as UsersIcon, UserCheck, Shield, UserX } from "lucide-react";

export default function UserStats({ users }) {
  // Calculate user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const officerUsers = users.filter((u) => u.role === "officer").length;
  const memberUsers = users.filter((u) => u.role === "member").length;
  const leaderUsers = users.filter((u) => u.role === "leader").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;

  return (
    <StatsGrid cols={4}>
      <StatsCard
        title="Total Users"
        value={totalUsers}
        description="All registered users"
        icon={UsersIcon}
        trend={{ value: 5, isPositive: true }}
      />
      <StatsCard
        title="Active Users"
        value={activeUsers}
        description="Currently active users"
        icon={UserCheck}
        className="border-green-200 bg-green-50/50"
        trend={{ value: 3, isPositive: true }}
      />
      <StatsCard
        title="Admins & Officers"
        value={adminUsers + officerUsers}
        description="Staff users"
        icon={Shield}
        className="border-blue-200 bg-blue-50/50"
        trend={{ value: 1, isPositive: true }}
      />
      <StatsCard
        title="Suspended Users"
        value={suspendedUsers}
        description="Users with suspended accounts"
        icon={UserX}
        className="border-red-200 bg-red-50/50"
        trend={{ value: 0, isPositive: true }}
      />
    </StatsGrid>
  );
}
