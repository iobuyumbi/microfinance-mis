// src/pages/Reports.jsx
import React, { useState } from 'react';

// Shadcn UI Imports
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


export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [selectedReport, setSelectedReport] = useState(null);

  // Sample data for reports
  const overviewData = {
    totalMembers: 156,
    activeLoans: 45,
    totalSavings: 125000,
    monthlyGrowth: 12.5,
    defaultRate: 2.3,
    portfolioAtRisk: 5.8
  };

  const loanReports = [
    { id: 1, borrower: 'John Doe', amount: 5000, status: 'Active', dueDate: '2024-12-31', remainingBalance: 3500 },
    { id: 2, borrower: 'Jane Smith', amount: 3000, status: 'Overdue', dueDate: '2024-07-15', remainingBalance: 2800 },
    { id: 3, borrower: 'Bob Johnson', amount: 7500, status: 'Active', dueDate: '2025-06-30', remainingBalance: 7200 }
  ];

  const savingsReports = [
    { id: 1, accountHolder: 'Alice Brown', balance: 2500, interestEarned: 87.5, accountType: 'Regular' },
    { id: 2, accountHolder: 'Charlie Wilson', balance: 5000, interestEarned: 200, accountType: 'Premium' },
    { id: 3, accountHolder: 'Diana Davis', balance: 1200, interestEarned: 36, accountType: 'Basic' }
  ];

  const transactionReports = [
    { month: 'Jan', deposits: 15000, withdrawals: 8000, loans: 25000 },
    { month: 'Feb', deposits: 18000, withdrawals: 9500, loans: 30000 },
    { month: 'Mar', deposits: 22000, withdrawals: 11000, loans: 35000 },
    { month: 'Apr', deposits: 20000, withdrawals: 10500, loans: 28000 },
    { month: 'May', deposits: 25000, withdrawals: 12000, loans: 40000 },
    { month: 'Jun', deposits: 28000, withdrawals: 13500, loans: 45000 }
  ];

  const generateReport = (type) => {
    const reportData = {
      overview: {
        title: 'Financial Overview Report',
        data: overviewData,
        generatedAt: new Date().toLocaleString()
      },
      loans: {
        title: 'Loan Portfolio Report',
        data: loanReports,
        generatedAt: new Date().toLocaleString()
      },
      savings: {
        title: 'Savings Account Report',
        data: savingsReports,
        generatedAt: new Date().toLocaleString()
      },
      transactions: {
        title: 'Transaction Analysis Report',
        data: transactionReports,
        generatedAt: new Date().toLocaleString()
      }
    };
    setSelectedReport(reportData[type]);
  };

  const exportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
    // In a real application, you'd trigger actual export logic here
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
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
      </div>

      ---

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loan Portfolio</TabsTrigger>
          <TabsTrigger value="savings">Savings Analysis</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{overviewData.totalMembers}</p>
                  <p className="text-sm text-green-600 mt-1">+{overviewData.monthlyGrowth}% this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Active Loans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{overviewData.activeLoans}</p>
                  <p className="text-sm text-gray-500 mt-1">Portfolio health: Good</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Total Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">${overviewData.totalSavings.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Across all accounts</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Default Rate</span>
                    <span className={`font-semibold ${
                      overviewData.defaultRate < 5 ? 'text-green-600' : 'text-red-600'
                    }`}>{overviewData.defaultRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Portfolio at Risk</span>
                    <span className={`font-semibold ${
                      overviewData.portfolioAtRisk < 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{overviewData.portfolioAtRisk}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    View Overdue Loans
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Generate Monthly Report
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Export Financial Summary
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Loan Portfolio Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.borrower}</TableCell>
                        <TableCell>${loan.amount.toLocaleString()}</TableCell>
                        <TableCell>${loan.remainingBalance.toLocaleString()}</TableCell>
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
            </CardContent>
          </Card>
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
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.accountHolder}</TableCell>
                        <TableCell>${account.balance.toLocaleString()}</TableCell>
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
              <div className="text-sm text-gray-500 mb-4">Note: Install 'recharts' package to see interactive charts</div>
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
                          <TableCell className="text-green-600">+${month.deposits.toLocaleString()}</TableCell>
                          <TableCell className="text-red-600">-${month.withdrawals.toLocaleString()}</TableCell>
                          <TableCell className="text-blue-600">${month.loans.toLocaleString()}</TableCell>
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

      ---

      {/* Generated Report Dialog */}
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
    </div>
  );
}