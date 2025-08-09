import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Building2, Plus } from "lucide-react";

const MeetingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">
            Manage group meetings and schedules
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Meeting
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Group Meetings
          </CardTitle>
          <CardDescription>
            View and manage all group meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Meeting Management</h3>
            <p className="text-muted-foreground mb-4">
              This page will display all group meetings with their schedules, attendees, and agendas.
            </p>
            <p className="text-sm text-muted-foreground">
              Features: Meeting scheduling, attendance tracking, agenda management, and minutes recording.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingsPage;
