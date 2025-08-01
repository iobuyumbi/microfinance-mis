import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OfficerGroupsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Group Supervision</h1>
        <p className="text-muted-foreground">Supervise assigned groups</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Groups</CardTitle>
          <CardDescription>View and supervise groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Group supervision features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerGroupsPage; 