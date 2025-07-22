// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
  DialogFooter
} from '../components/ui';
import { PageLayout, PageSection, StatsGrid, FiltersSection, ContentCard } from '../components/layouts/PageLayout';
import { toast } from 'sonner';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overviewData, setOverviewData] = useState(null);
  const [loanReports, setLoanReports] = useState([]);
  const [savingsReports, setSavingsReports] = useState([]);
  const [transactionReports, setTransactionReports] = useState([]);

  useEffect(() => {
    fetchAllReports();
  }, [dateRange]);

  const fetchAllReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [overview, loans, savings, transactions] = await Promise.all([
        reportService.getFinancialSummary({ range: dateRange }),
        reportService.getLoanReports({ range: dateRange }),
        reportService.getSavingsReports({ range: dateRange }),
        reportService.getTransactionReports({ range: dateRange }),
      ]);
      setOverviewData(overview);
      setLoanReports(Array.isArray(loans) ? loans : []);
      setSavingsReports(Array.isArray(savings) ? savings : []);
      setTransactionReports(Array.isArray(transactions) ? transactions : []);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (type) => {
    let reportData;
    if (type === 'overview') {
      reportData = {
        title: 'Financial Overview Report',
        data: overviewData,
        generatedAt: new Date().toLocaleString()
      };
    } else if (type === 'loans') {
      reportData = {
        title: 'Loan Portfolio Report',
        data: loanReports,
        generatedAt: new Date().toLocaleString()
      };
    } else if (type === 'savings') {
      reportData = {
        title: 'Savings Account Report',
        data: savingsReports,
        generatedAt: new Date().toLocaleString()
      };
    } else if (type === 'transactions') {
      reportData = {
        title: 'Transaction Analysis Report',
        data: transactionReports,
        generatedAt: new Date().toLocaleString()
      };
    }
    setSelectedReport(reportData);
  };

  const exportReport = (format) => {
    toast.info(`Exporting report as ${format.toUpperCase()}...`);
    // In a real application, you'd trigger actual export logic here
  };

  if (loading) return <div className="p-6">Loading reports...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <PageLayout 
      title="Reports & Analytics" 
      action={
        <div className="flex space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
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
          <Button onClick={() => generateReport(activeTab)}>
            Generate Report
          </Button>
        </div>
      }
    >
      <PageSection>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="loans">Loan Portfolio</TabsTrigger>
            <TabsTrigger value="savings">Savings Analysis</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <PageSection>
              {overviewData && (
                <StatsGrid>
                  <ContentCard title="Total Members">
                    <p className="text-3xl font-bold text-blue-600">{overviewData.totalMembers}</p>
                    <p className="text-sm text-green-600 mt-1">+{overviewData.monthlyGrowth}% this month</p>
                  </ContentCard>
                  <ContentCard title="Active Loans">
                    <p className="text-3xl font-bold text-green-600">{overviewData.activeLoans}</p>
                    <p className="text-sm text-gray-500 mt-1">Portfolio health: Good</p>
                  </ContentCard>
                  <ContentCard title="Total Savings">
                    <p className="text-3xl font-bold text-purple-600">${overviewData.totalSavings?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Across all accounts</p>
                  </ContentCard>
                </StatsGrid>
              )}
            </PageSection>
          </TabsContent>
          <TabsContent value="loans">
            <PageSection>
              <ContentCard title="Loan Portfolio Analysis">
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
                    {loanReports.map((loan) => {
                      const progress = ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
                      return (
                        <TableRow key={loan.id || loan._id}>
                          <TableCell className="font-medium">{loan.borrower}</TableCell>
                          <TableCell>${loan.amount?.toLocaleString()}</TableCell>
                          <TableCell>${loan.remainingBalance?.toLocaleString()}</TableCell>
                          <TableCell>{loan.dueDate}</TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              loan.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {loan.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{progress.toFixed(1)}% paid</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ContentCard>
            </PageSection>
          </TabsContent>
        <TabsContent value="savings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Savings Account Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                  {savingsReports.map((account) => {
                    const interestRate = (account.interestEarned / account.balance) * 100;
                    return (
                      <TableRow key={account.id || account._id}>
                        <TableCell className="font-medium">{account.accountHolder}</TableCell>
                        <TableCell>${account.balance?.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">+${account.interestEarned}</TableCell>
                        <TableCell>{account.accountType}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            interestRate > 3 ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {interestRate.toFixed(1)}% yield
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Monthly Transaction Trends</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {transactionReports.map((month) => {
                      const netFlow = month.deposits - month.withdrawals + month.loans;
                      return (
                        <TableRow key={month.month}>
                          <TableCell className="font-medium">{month.month}</TableCell>
                          <TableCell className="text-green-600">+${month.deposits?.toLocaleString()}</TableCell>
                          <TableCell className="text-red-600">-${month.withdrawals?.toLocaleString()}</TableCell>
                          <TableCell className="text-blue-600">${month.loans?.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">
                            <span className={netFlow > 0 ? 'text-green-600' : 'text-red-600'}>
                              {netFlow > 0 ? '+' : ''}${netFlow.toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={selectedReport !== null} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Generated: {selectedReport?.generatedAt}</p>
          </div>
          <div className="mb-6">
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto border border-gray-200">
              {JSON.stringify(selectedReport?.data, null, 2)}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => exportReport('pdf')}>
              Export PDF
            </Button>
            <Button variant="secondary" onClick={() => exportReport('excel')}>
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </PageSection>
    </PageLayout>
  );
}