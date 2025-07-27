// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { dashboardService } from "@/services/dashboardService";

// Import custom layout components that now integrate Shadcn
import {
  PageLayout,
  PageSection,
  StatsGrid,
  ContentCard,
} from "@/components/layouts/PageLayout";
import { toast } from "sonner"; // For toast notifications

// Assuming AuthContext is correctly set up in your project
import { useAuth } from "../context/AuthContext";

// Import necessary Shadcn UI components if directly used outside custom layouts
import {
  Button, // Example: if you add a button to the dashboard header
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/index"; // Using index to import multiple from ui

// Import Lucide React Icons for visual elements
import { Users, DollarSign, PiggyBank, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth(); // Access user from AuthContext

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err.message || "Failed to load dashboard stats";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render loading and error states within the PageLayout for consistent styling
  if (loading) {
    return (
      <PageLayout title="Dashboard">
        {/* Display a general loading message */}
        <div className="p-6 text-center text-muted-foreground">
          Loading dashboard...
        </div>
        {/* Render skeleton cards for the overview section */}
        <PageSection title="Overview">
          <StatsGrid cols={4}>
            {/* Map over an array to render multiple skeleton ContentCards */}
            {Array.from({ length: 4 }).map((_, i) => (
              <ContentCard key={i} isLoading={true} /> // Pass isLoading prop to show skeleton
            ))}
          </StatsGrid>
        </PageSection>
        {/* You might also render skeleton for other sections if they are present */}
        <PageSection title="Recent Activity">
          <ContentCard isLoading={true}>
            {/* Skeleton for table or other content */}
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          </ContentCard>
        </PageSection>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Dashboard">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard">
      <PageSection title="Overview">
        <StatsGrid cols={4}>
          {/* Pass the title prop to ContentCard */}
          <ContentCard title="Total Members">
            <div className="flex items-center justify-between">
              {/* Content within ContentCard's children */}
              <p className="text-2xl font-bold">{stats?.totalMembers ?? "-"}</p>
              <Users className="h-6 w-6 text-muted-foreground" />{" "}
              {/* Icon added */}
            </div>
          </ContentCard>

          <ContentCard title="Active Loans">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-green-600">
                {stats?.activeLoans ?? "-"}
              </p>
              <DollarSign className="h-6 w-6 text-green-600" />{" "}
              {/* Icon added */}
            </div>
          </ContentCard>

          <ContentCard title="Total Savings">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-purple-600">
                ${stats?.totalSavings?.toLocaleString() ?? "-"}
              </p>
              <PiggyBank className="h-6 w-6 text-purple-600" />{" "}
              {/* Icon added */}
            </div>
          </ContentCard>

          <ContentCard title="Monthly Growth">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-blue-600">
                {stats?.monthlyGrowth ?? "-"}%
              </p>
              <TrendingUp className="h-6 w-6 text-blue-600" />{" "}
              {/* Icon added */}
            </div>
          </ContentCard>
        </StatsGrid>
      </PageSection>

      {/* Example: Recent Activity Section */}
      <PageSection title="Recent Activity">
        <ContentCard title="Latest Transactions">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2023-07-20</TableCell>
                <TableCell>Loan Repayment</TableCell>
                <TableCell>$150.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-07-19</TableCell>
                <TableCell>Savings Deposit</TableCell>
                <TableCell>$50.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-07-18</TableCell>
                <TableCell>Loan Disbursement</TableCell>
                <TableCell>$500.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ContentCard>
      </PageSection>
    </PageLayout>
  );
}
