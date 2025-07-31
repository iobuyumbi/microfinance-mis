import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

const AdminUsersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600">
          Manage system users and their permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users Overview
          </CardTitle>
          <CardDescription>
            This page will contain user management functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            User management features will be implemented here, including:
          </p>
          <ul className="mt-2 text-gray-500 list-disc list-inside space-y-1">
            <li>View all users</li>
            <li>Add new users</li>
            <li>Edit user details</li>
            <li>Manage user roles and permissions</li>
            <li>User activity tracking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
