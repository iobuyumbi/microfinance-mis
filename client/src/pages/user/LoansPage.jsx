import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Handshake } from "lucide-react";

const UserLoansPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Loans</h1>
        <p className="text-gray-600">
          View and manage your loan applications and repayments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Loan Overview
          </CardTitle>
          <CardDescription>
            This page will contain loan management functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Loan management features will be implemented here, including:
          </p>
          <ul className="mt-2 text-gray-500 list-disc list-inside space-y-1">
            <li>View active loans</li>
            <li>Loan application history</li>
            <li>Repayment schedules</li>
            <li>Make loan repayments</li>
            <li>Loan statements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLoansPage;
