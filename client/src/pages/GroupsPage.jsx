import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Building2, Plus } from "lucide-react";

const GroupsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups Management</h1>
          <p className="text-muted-foreground">
            Manage microfinance groups and their members
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Microfinance Groups
          </CardTitle>
          <CardDescription>
            View and manage all groups in the microfinance system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Groups Management</h3>
            <p className="text-muted-foreground mb-4">
              This page will display all groups with their members, savings, and loan information.
            </p>
            <p className="text-sm text-muted-foreground">
              Features: Group creation, member management, savings tracking, and loan coordination.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupsPage;
