import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OfficerSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Officer Settings</h1>
        <p className="text-muted-foreground">Configure officer settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Officer configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Officer settings features coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerSettingsPage; 