import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminContributionsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contributions</h1>
        <p className="text-muted-foreground">Manage group contributions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contributions</CardTitle>
          <CardDescription>View and manage contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Contribution management features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContributionsPage;
