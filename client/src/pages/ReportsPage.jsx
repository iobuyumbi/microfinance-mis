
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, DollarSign, Users, CreditCard, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { reportService } from '../services/reportService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('overview');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReports({
        type: reportType,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      setReportData(response.data || {});
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
      setReportData({});
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format = 'pdf') => {
    try {
      setExporting(true);
      await reportService.exportReport({
        type: reportType,
        format,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const {
    overview = {},
    loanStats = {},
    savingsStats = {},
    transactionStats = {},
    groupStats = {},
    monthlyTrends = [],
    loanStatusDistribution = [],
    topPerformingGroups = []
  } = reportData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive financial insights and reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('pdf')} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('excel')} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="loans">Loans Report</SelectItem>
                  <SelectItem value="savings">Savings Report</SelectItem>
                  <SelectItem value="transactions">Transactions Report</SelectItem>
                  <SelectItem value="groups">Groups Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={fetchReportData} className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${overview.totalLoansAmount?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.totalLoansCount || 0} active loans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${overview.totalSavingsAmount?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.totalSavingsAccounts || 0} savings accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.activeGroups || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.totalMembers || 0} total members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${overview.monthlyRevenue?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.revenueGrowth > 0 ? '+' : ''}{overview.revenueGrowth?.toFixed(1) || 0}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="loans" stroke="#3b82f6" name="Loans" />
                    <Line type="monotone" dataKey="savings" stroke="#10b981" name="Savings" />
                    <Line type="monotone" dataKey="transactions" stroke="#f59e0b" name="Transactions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={loanStatusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {loanStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPerformingGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalSavings" fill="#3b82f6" name="Savings" />
                  <Bar dataKey="totalLoans" fill="#10b981" name="Loans" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${loanStats.totalOutstanding?.toLocaleString() || '0'}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Across {loanStats.activeLoans || 0} active loans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{loanStats.collectionRate?.toFixed(1) || '0'}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  ${loanStats.totalCollected?.toLocaleString() || '0'} collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{loanStats.defaultRate?.toFixed(1) || '0'}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {loanStats.defaultedLoans || 0} defaulted loans
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${savingsStats.totalBalance?.toLocaleString() || '0'}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {savingsStats.totalAccounts || 0} savings accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${savingsStats.averageBalance?.toLocaleString() || '0'}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Per savings account
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {savingsStats.monthlyGrowth > 0 ? '+' : ''}{savingsStats.monthlyGrowth?.toFixed(1) || '0'}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Compared to last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${transactionStats.totalVolume?.toLocaleString() || '0'}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {transactionStats.totalCount || 0} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${transactionStats.totalDeposits?.toLocaleString() || '0'}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {transactionStats.depositCount || 0} deposits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${transactionStats.totalWithdrawals?.toLocaleString() || '0'}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {transactionStats.withdrawalCount || 0} withdrawals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionStats.successRate?.toFixed(1) || '0'}%</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Transaction success rate
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{groupStats.activeGroups || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {groupStats.totalMembers || 0} total members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Group Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{groupStats.averageGroupSize?.toFixed(1) || '0'}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Members per group
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{groupStats.performanceScore?.toFixed(1) || '0'}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Overall performance score
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>Select a report type and date range to view detailed analytics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
