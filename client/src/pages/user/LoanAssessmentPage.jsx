// client/src/pages/user/LoanAssessmentPage.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const UserLoanAssessmentPage = () => {
  const { user } = useAuth(); // Use useAuth hook for user data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Loan Assessment Status
        </h1>
        <p className="text-gray-600">
          Track the status of your loan applications and assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Assessments
            </CardTitle>
            <CardDescription>
              Your loan applications currently under review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              This section shows the status of your loan applications that are
              currently being assessed by a loan officer. You can see the
              current stage of the process.
            </p>
            <ul className="mt-2 text-gray-500 list-disc list-inside space-y-1">
              <li>View application submission date</li>
              <li>See current assessment stage</li>
              <li>Check for required additional documents</li>
              <li>Receive updates on assessment progress</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Assessments
            </CardTitle>
            <CardDescription>
              Your loan applications that have been assessed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Here you can find the results of your past loan assessments,
              including approval or rejection status and any relevant feedback.
            </p>
            <ul className="mt-2 text-gray-500 list-disc list-inside space-y-1">
              <li>View final assessment decision</li>
              <li>Access assessment report (if applicable)</li>
              <li>Review loan terms for approved applications</li>
              <li>Understand reasons for rejection (if applicable)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserLoanAssessmentPage;
