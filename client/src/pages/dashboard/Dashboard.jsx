import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { reportService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoanDefaulters: 0,
    upcomingRepayments: [],
    financialSummary: {
      totalDisbursed: 0,
      totalCollected: 0,
      totalOutstanding: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [loansDisbursed, defaulters, repayments, financials] =
          await Promise.all([
            reportService.getTotalLoansDisbursed(),
            reportService.getActiveLoanDefaulters(),
            reportService.getUpcomingRepayments(),
            reportService.getFinancialSummary(),
          ]);

        setStats({
          totalLoans: loansDisbursed.total,
          activeLoanDefaulters: defaulters.length,
          upcomingRepayments: repayments,
          financialSummary: financials,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your microfinance operations today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <span className="material-icons text-muted-foreground">
              account_balance
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoans}</div>
            <p className="text-xs text-muted-foreground">
              Active loans in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Disbursed
            </CardTitle>
            <span className="material-icons text-muted-foreground">
              payments
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.financialSummary.totalDisbursed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime loan amount disbursed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collected
            </CardTitle>
            <span className="material-icons text-muted-foreground">
              savings
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.financialSummary.totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total repayments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defaulters</CardTitle>
            <span className="material-icons text-muted-foreground">
              warning
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeLoanDefaulters}
            </div>
            <p className="text-xs text-muted-foreground">
              Active loans in default
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Repayments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingRepayments.slice(0, 5).map((repayment) => (
                <div
                  key={repayment._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{repayment.borrower.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(repayment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="font-bold">
                    ${repayment.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ${stats.financialSummary.totalOutstanding.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total amount yet to be collected from all active loans
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
