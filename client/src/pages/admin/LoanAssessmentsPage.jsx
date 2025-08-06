// client/src/pages/admin/LoanAssessmentPage.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Search, BarChart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AdminLoanAssessmentPage = () => {
  const { user } = useAuth(); // Use useAuth hook for user data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Loan Assessments
        </h1>
        <p className="text-gray-600">
          Overview of all loan assessments and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Assessments
            </CardTitle>
            <CardDescription>
              View and manage all loan assessment records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              This section will provide a comprehensive list of all loan
              assessments, allowing administrators to review, audit, and manage
              them.
            </p>
            <ul className="mt-2 text-gray-500 list-disc list-inside space-y-1">
              <li>Search and filter assessments</li>
              <li>View detailed assessment reports</li>
              <li>Audit assessment decisions</li>
              <li>Generate assessment summaries</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Assessment Analytics
            </CardTitle>
            <CardDescription>
              Analyze assessment performance and trends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Gain insights into loan assessment processes, identify
              bottlenecks, and track key performance indicators related to
              assessments.
            </p>
            <ul className="mt-2 text-gray-500 list-disc list-inside space-y-1">
              <li>Assessment approval rates</li>
              <li>Average assessment time</li>
              <li>Officer performance metrics</li>
              <li>Risk assessment trends</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Configure assessment rules and parameters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Set up and adjust the rules and parameters that govern the loan
              assessment process.
            </p>
            <ul className="mt-2 text-gray-500 list-disc list-inside space-y-1">
              <li>Define credit scoring models</li>
              <li>Set eligibility criteria</li>
              <li>Manage assessment templates</li>
              <li>Automate assessment workflows</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoanAssessmentPage;
