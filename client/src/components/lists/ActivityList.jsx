import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Users, DollarSign, PiggyBank, Building2, Activity } from "lucide-react";

const ActivityList = () => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "member_registered",
      message: "New member registered",
      details: "John Doe joined the platform",
      time: "2 hours ago",
      icon: Users,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      type: "loan_approved",
      message: "Loan approved",
      details: "Business loan for $5,000 approved",
      time: "1 day ago",
      icon: DollarSign,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      type: "savings_deposit",
      message: "Savings deposit",
      details: "$500 deposited to emergency fund",
      time: "3 days ago",
      icon: PiggyBank,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: 4,
      type: "group_created",
      message: "New group created",
      details: "Group 'Business Ventures' created",
      time: "1 week ago",
      icon: Building2,
      color: "bg-orange-100 text-orange-600"
    },
    {
      id: 5,
      type: "payment_received",
      message: "Payment received",
      details: "Loan payment of $150 received",
      time: "1 week ago",
      icon: DollarSign,
      color: "bg-green-100 text-green-600"
    }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{activity.message}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
              </div>
              <Badge variant="secondary">{activity.time}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityList;
