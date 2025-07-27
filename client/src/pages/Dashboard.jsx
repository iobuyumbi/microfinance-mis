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
// For example, if you had a Button directly in Dashboard, you'd import it here:
import { Button } from "@/components/ui/button"; // Example: if you add a button to the dashboard header

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
        <div className="p-6 text-center text-muted-foreground">
          Loading dashboard...
        </div>
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
          {/* ContentCard now internally uses Shadcn Card, CardHeader, CardTitle, CardContent */}
          <ContentCard>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Total Members</h3>
              {/* You can add an icon here, e.g., from lucide-react */}
              {/* <Users className="h-5 w-5 text-muted-foreground" /> */}
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats?.totalMembers ?? "-"}
            </p>
          </ContentCard>

          <ContentCard>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Active Loans</h3>
              {/* <DollarSign className="h-5 w-5 text-green-600" /> */}
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {stats?.activeLoans ?? "-"}
            </p>
          </ContentCard>

          <ContentCard>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Total Savings</h3>
              {/* <PiggyBank className="h-5 w-5 text-purple-600" /> */}
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              ${stats?.totalSavings?.toLocaleString() ?? "-"}
            </p>
          </ContentCard>

          <ContentCard>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Monthly Growth</h3>
              {/* <TrendingUp className="h-5 w-5 text-blue-600" /> */}
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {stats?.monthlyGrowth ?? "-"}%
            </p>
          </ContentCard>
        </StatsGrid>
      </PageSection>

      {/* You can add more sections here using PageSection and ContentCard */}
      {/* Example:
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
            </TableBody>
          </Table>
        </ContentCard>
      </PageSection>
      */}
    </PageLayout>
  );
}
