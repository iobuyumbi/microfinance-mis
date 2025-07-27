// src/pages/Reports.jsx
import React, { useState, useEffect } from "react";
import { reportService } from "@/services/reportService"; // Assuming this path is correct

// Shadcn UI Imports (consolidated and ensuring correct paths)
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Badge, // Added for status display
} from "@/components/ui"; // Assuming this path works for multiple imports

// Custom Layout Components (from src/components/layouts/PageLayout.jsx)
import {
  PageLayout,
  PageSection,
  StatsGrid,
  FiltersSection,
  ContentCard,
} from "@/components/layouts/PageLayout";
import { toast } from "sonner"; // For toast notifications

// Lucide React Icons (for visual enhancements)
import {
  PieChart, // General report icon
  CreditCard, // Loans
  PiggyBank, // Savings
  TrendingUp, // Transactions
  Users, // Members (for overview stat)
  DollarSign, // Money related
  Calendar, // Date
  FileText, // Generic report/document
  Download, // Export action
} from "lucide-react";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30");
  const [selectedReport, setSelectedReport] = useState(null); // For the detailed report dialog
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data states for each tab
  const [overviewData, setOverviewData] = useState(null);
  const [loanReports, setLoanReports] = useState([]);
  const [savingsReports, setSavingsReports] = useState([]);
  const [transactionReports, setTransactionReports] = useState([]);

  // Fetch all reports based on dateRange
  useEffect(() => {
    fetchAllReports();
  }, [dateRange]); // Re-fetch when dateRange changes

  const fetchAllReports = async () => {
    setLoading(true);
    setError("");
    try {
      // Use Promise.all to fetch all data concurrently
      const [overview, loans, savings, transactions] = await Promise.all([
        reportService.getFinancialSummary({ range: dateRange }),
        reportService.getLoanReports({ range: dateRange }),
        reportService.getSavingsReports({ range: dateRange }),
        reportService.getTransactionReports({ range: dateRange }),
      ]);

      setOverviewData(overview);
      // Ensure data is always an array for tables
      setLoanReports(Array.isArray(loans) ? loans : []);
      setSavingsReports(Array.isArray(savings) ? savings : []);
      setTransactionReports(Array.isArray(transactions) ? transactions : []);
    } catch (err) {
      const errorMessage = err.message || "Failed to load reports";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to prepare data for the detailed report dialog
  const generateReport = (type) => {
    let reportData;
    if (type === "overview") {
      reportData = {
        title: "Financial Overview Report",
        data: overviewData,
        generatedAt: new Date().toLocaleString(),
      };
    } else if (type === "loans") {
      reportData = {
        title: "Loan Portfolio Report",
        data: loanReports,
        generatedAt: new Date().toLocaleString(),
      };
    } else if (type === "savings") {
      reportData = {
        title: "Savings Account Report",
        data: savingsReports,
        generatedAt: new Date().toLocaleString(),
      };
    } else if (type === "transactions") {
      reportData = {
        title: "Transaction Analysis Report",
        data: transactionReports,
        generatedAt: new Date().toLocaleString(),
      };
    }
    setSelectedReport(reportData);
  };

  // Placeholder for export functionality
  const exportReport = (format) => {
    toast.info(
      `Exporting report as ${format.toUpperCase()}... (Functionality not implemented)`
    );
    // In a real application, you'd trigger actual export logic here
    // e.g., calling a backend API to generate and download the file
  };

  // Render loading and error states using PageLayout for consistent UI
  if (loading && !overviewData) {
    // Only show full loading overlay if no data loaded yet
    return (
      <PageLayout title="Reports & Analytics">
        <div className="p-6 text-center text-muted-foreground">
          Loading reports...
        </div>
      </PageLayout>
    );
  }

  if (error && !overviewData) {
    // Only show error if no data loaded yet
    return (
      <PageLayout title="Reports & Analytics">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Reports & Analytics"
      action={
        <div className="flex space-x-3">
          <Select
            value={dateRange}
            onValueChange={setDateRange}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => generateReport(activeTab)} disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      }
    >
      {/* Main content area with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loan Portfolio</TabsTrigger>
          <TabsTrigger value="savings">Savings Analysis</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview">
          <PageSection title="Financial Summary" spacing="tight">
            <StatsGrid>
              <ContentCard isLoading={loading} title="Total Members">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <p className="text-3xl font-bold">
                    {overviewData?.totalMembers ?? "-"}
                  </p>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  +{overviewData?.monthlyGrowth ?? "-"}% this month
                </p>
              </ContentCard>
              <ContentCard isLoading={loading} title="Active Loans">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <p className="text-3xl font-bold">
                    {overviewData?.activeLoans ?? "-"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Portfolio health: Good
                </p>
              </ContentCard>
              <ContentCard isLoading={loading} title="Total Savings">
                <div className="flex items-center space-x-2">
                  <PiggyBank className="h-5 w-5 text-purple-600" />
                  <p className="text-3xl font-bold text-purple-600">
                    ${overviewData?.totalSavings?.toLocaleString() ?? "-"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Across all accounts
                </p>
              </ContentCard>
              <ContentCard isLoading={loading} title="Net Income (Placeholder)">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <p className="text-3xl font-bold text-orange-600">
                    ${overviewData?.netIncome ?? "N/A"}
                  </p>{" "}
                  {/* Assuming netIncome might be added to overviewData */}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Last {dateRange} days
                </p>
              </ContentCard>
            </StatsGrid>
          </PageSection>
        </TabsContent>

        {/* Loan Portfolio Tab Content */}
        <TabsContent value="loans">
          <PageSection title="Loan Portfolio Analysis" spacing="tight">
            <ContentCard isLoading={loading} title="Loan Details">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Skeleton rows for loading state
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : loanReports.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-4"
                      >
                        No loan reports found for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loanReports.map((loan) => {
                      const progress = loan.amount
                        ? ((loan.amount - loan.remainingBalance) /
                            loan.amount) *
                          100
                        : 0;
                      return (
                        <TableRow key={loan.id || loan._id}>
                          <TableCell className="font-medium">
                            {loan.borrower}
                          </TableCell>
                          <TableCell>
                            ${loan.amount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ${loan.remainingBalance?.toLocaleString()}
                          </TableCell>
                          <TableCell>{loan.dueDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                loan.status === "Active"
                                  ? "default"
                                  : loan.status === "Paid"
                                    ? "outline"
                                    : "secondary" // Fallback for other statuses
                              }
                            >
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {progress.toFixed(1)}% paid
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ContentCard>
          </PageSection>
        </TabsContent>

        {/* Savings Analysis Tab Content */}
        <TabsContent value="savings">
          <PageSection title="Savings Account Performance" spacing="tight">
            <ContentCard isLoading={loading} title="Savings Details">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Holder</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Interest Earned</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Skeleton rows for loading state
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : savingsReports.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-4"
                      >
                        No savings reports found for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    savingsReports.map((account) => {
                      const interestRate =
                        account.balance && account.interestEarned
                          ? (account.interestEarned / account.balance) * 100
                          : 0;
                      return (
                        <TableRow key={account.id || account._id}>
                          <TableCell className="font-medium">
                            {account.accountHolder}
                          </TableCell>
                          <TableCell>
                            ${account.balance?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-green-600">
                            +${account.interestEarned?.toLocaleString()}
                          </TableCell>
                          <TableCell>{account.accountType}</TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
                                interestRate > 3
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {interestRate.toFixed(1)}% yield
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ContentCard>
          </PageSection>
        </TabsContent>

        {/* Transaction Trends Tab Content */}
        <TabsContent value="transactions">
          <PageSection title="Monthly Transaction Trends" spacing="tight">
            <ContentCard isLoading={loading} title="Transaction Details">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Deposits</TableHead>
                      <TableHead>Withdrawals</TableHead>
                      <TableHead>Loans</TableHead>
                      <TableHead>Net Flow</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Skeleton rows for loading state
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-muted rounded w-1/3"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-muted rounded w-2/3 ml-auto"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : transactionReports.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-4"
                        >
                          No transaction reports found for this period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactionReports.map((month) => {
                        const netFlow =
                          month.deposits - month.withdrawals + month.loans;
                        return (
                          <TableRow key={month.month}>
                            <TableCell className="font-medium">
                              {month.month}
                            </TableCell>
                            <TableCell className="text-green-600">
                              +${month.deposits?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-red-600">
                              -${month.withdrawals?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-blue-600">
                              ${month.loans?.toLocaleString()}
                            </TableCell>
                            <TableCell className="font-semibold">
                              <span
                                className={
                                  netFlow > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {netFlow > 0 ? "+" : ""}$
                                {netFlow.toLocaleString()}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </ContentCard>
          </PageSection>
        </TabsContent>
      </Tabs>

      {/* Detailed Report Dialog */}
      <Dialog
        open={selectedReport !== null}
        onOpenChange={() => setSelectedReport(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Generated: {selectedReport?.generatedAt}
            </p>
          </div>
          <div className="mb-6">
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto border border-border">
              {JSON.stringify(selectedReport?.data, null, 2)}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => exportReport("pdf")}>
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button variant="secondary" onClick={() => exportReport("excel")}>
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
