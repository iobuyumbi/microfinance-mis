import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  PieChart,
  LineChart,
  Activity,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { ENDPOINTS } from "@/services/api/endpoints";

const ReportsPage = () => {
  const { getReports, getDashboardReport, loading } = useApi();
  const { hasRole } = useAuth();
  const [selectedReport, setSelectedReport] = useState("dashboard");
  const [dateRange, setDateRange] = useState("month");
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateRange]);

  const loadReportData = async () => {
    try {
      let result;
      switch (selectedReport) {
        case "dashboard":
          result = await getDashboardReport();
          break;
        case "loans":
          result = await getReports(ENDPOINTS.REPORTS.LOANS, { dateRange });
          break;
        case "savings":
          result = await getReports(ENDPOINTS.REPORTS.SAVINGS, { dateRange });
          break;
        case "transactions":
          result = await getReports(ENDPOINTS.REPORTS.TRANSACTIONS, {
            dateRange,
          });
          break;
        case "members":
          result = await getReports(ENDPOINTS.REPORTS.MEMBERS, { dateRange });
          break;
        case "groups":
          result = await getReports(ENDPOINTS.REPORTS.GROUPS, { dateRange });
          break;
        default:
          result = await getDashboardReport();
      }

      if (result.success) {
        setReportData(result.data);
      }
    } catch (error) {
      console.error("Failed to load report data:", error);
    }
  };

  const handleExport = (format = "pdf") => {
    // Implementation for report export
    console.log(`Exporting ${selectedReport} report as ${format}`);
  };

  const reports = [
    {
      id: "dashboard",
      name: "Dashboard Overview",
      description: "Key performance indicators and summary statistics",
      icon: BarChart3,
      availableFor: ["admin", "officer", "leader"],
    },
    {
      id: "loans",
      name: "Loan Reports",
      description: "Loan performance, disbursements, and repayments",
      icon: DollarSign,
      availableFor: ["admin", "officer"],
    },
    {
      id: "savings",
      name: "Savings Reports",
      description: "Savings account performance and trends",
      icon: TrendingUp,
      availableFor: ["admin", "officer"],
    },
    {
      id: "transactions",
      name: "Transaction Reports",
      description: "Financial transaction analysis and summaries",
      icon: Activity,
      availableFor: ["admin", "officer"],
    },
    {
      id: "members",
      name: "Member Reports",
      description: "Member statistics and demographics",
      icon: Users,
      availableFor: ["admin", "officer", "leader"],
    },
    {
      id: "groups",
      name: "Group Reports",
      description: "Group performance and meeting statistics",
      icon: Users,
      availableFor: ["admin", "officer", "leader"],
    },
  ];

  const filteredReports = reports.filter((report) =>
    report.availableFor.some((role) => hasRole(role))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and view comprehensive reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Report Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report</CardTitle>
          <CardDescription>
            Choose the type of report you want to generate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const Icon = report.icon;
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-gray-500">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reports.find((r) => r.id === selectedReport)?.name || "Report"}
          </CardTitle>
          <CardDescription>
            {reports.find((r) => r.id === selectedReport)?.description ||
              "Report details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading report...</p>
              </div>
            </div>
          ) : (
            <ReportContent reportType={selectedReport} data={reportData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ReportContent = ({ reportType, data }) => {
  switch (reportType) {
    case "dashboard":
      return <DashboardReport data={data} />;
    case "loans":
      return <LoanReport data={data} />;
    case "savings":
      return <SavingsReport data={data} />;
    case "transactions":
      return <TransactionReport data={data} />;
    case "members":
      return <MemberReport data={data} />;
    case "groups":
      return <GroupReport data={data} />;
    default:
      return <DashboardReport data={data} />;
  }
};

const DashboardReport = ({ data }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Members
                    </p>
                    <p className="text-2xl font-bold">
                      {data?.totalMembers || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Loans
                    </p>
                    <p className="text-2xl font-bold">
                      {data?.activeLoans || 0}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Savings
                    </p>
                    <p className="text-2xl font-bold">
                      ${(data?.totalSavings || 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Repayment Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {(data?.repaymentRate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.recentActivity?.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {activity.time}
                      </span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Loan Repayment Rate</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Member Retention</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Meeting Attendance</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Financial reports and charts will be displayed here.</p>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Operational reports and metrics will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const LoanReport = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8 text-gray-500">
        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Loan reports and analytics will be displayed here.</p>
      </div>
    </div>
  );
};

const SavingsReport = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Savings reports and analytics will be displayed here.</p>
      </div>
    </div>
  );
};

const TransactionReport = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8 text-gray-500">
        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Transaction reports and analytics will be displayed here.</p>
      </div>
    </div>
  );
};

const MemberReport = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Member reports and analytics will be displayed here.</p>
      </div>
    </div>
  );
};

const GroupReport = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Group reports and analytics will be displayed here.</p>
      </div>
    </div>
  );
};

export default ReportsPage;
