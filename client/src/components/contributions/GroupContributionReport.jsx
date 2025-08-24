import React, { useState, useEffect } from "react";
import {
  FacebookCard,
  FacebookCardContent,
  FacebookCardHeader,
} from "../ui/facebook-card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter,
  PieChart,
} from "lucide-react";
import { contributionService } from "../../services/contributionService";
import { formatCurrency } from "../../utils/formatters";

const GroupContributionReport = ({ group }) => {
  const [reportData, setReportData] = useState({
    totalContributions: 0,
    totalAmount: 0,
    averageContribution: 0,
    activeMembers: 0,
    totalMembers: 0,
    monthlyTrends: [],
    memberBreakdown: [],
    complianceRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], // Start of year
    end: new Date().toISOString().split("T")[0], // Today
  });
  const [reportType, setReportType] = useState("summary");

  useEffect(() => {
    if (group) {
      fetchGroupReport();
    }
  }, [group, dateRange, reportType]);

  const fetchGroupReport = async () => {
    try {
      setLoading(true);
      const params = {
        groupId: group._id,
        startDate: dateRange.start,
        endDate: dateRange.end,
        reportType,
      };

      const [summaryResponse, trendsResponse, membersResponse] =
        await Promise.all([
          contributionService.getGroupSummary(group._id),
          contributionService.getReports({ ...params, type: "trends" }),
          contributionService.getReports({ ...params, type: "members" }),
        ]);

      const summary = summaryResponse.data.data;
      const trends = trendsResponse.data.data || [];
      const members = membersResponse.data.data || [];

      setReportData({
        totalContributions: summary.totalContributions || 0,
        totalAmount: summary.totalAmount || 0,
        averageContribution: summary.averageContribution || 0,
        activeMembers: summary.activeMembers || 0,
        totalMembers: summary.totalMembers || 0,
        monthlyTrends: trends,
        memberBreakdown: members,
        complianceRate: summary.complianceRate || 0,
      });
    } catch (error) {
      console.error("Error fetching group report:", error);
      toast.error("Failed to load group report");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await contributionService.export({
        groupId: group._id,
        startDate: dateRange.start,
        endDate: dateRange.end,
        reportType,
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `group-report-${group.name}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Group report exported successfully");
    } catch (error) {
      console.error("Error exporting group report:", error);
      toast.error("Failed to export group report");
    }
  };

  const getComplianceColor = (rate) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Use the imported formatCurrency function that respects app settings

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Group Contribution Report</h2>
          <p className="text-muted-foreground">
            {group.name} - Financial Performance Analysis
          </p>
        </div>
        <Button onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Report Filters</h3>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="trends">Trends Analysis</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchGroupReport} className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <FacebookCard>
          <FacebookCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Contributions
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.totalAmount)}
                </p>
              </div>
            </div>
          </FacebookCardContent>
        </FacebookCard>

        <FacebookCard>
          <FacebookCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold">
                  {reportData.totalContributions}
                </p>
              </div>
            </div>
          </FacebookCardContent>
        </FacebookCard>

        <FacebookCard>
          <FacebookCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Members
                </p>
                <p className="text-2xl font-bold">
                  {reportData.activeMembers}/{reportData.totalMembers}
                </p>
              </div>
            </div>
          </FacebookCardContent>
        </FacebookCard>

        <FacebookCard>
          <FacebookCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Compliance Rate
                </p>
                <p
                  className={`text-2xl font-bold ${getComplianceColor(
                    reportData.complianceRate
                  )}`}
                >
                  {reportData.complianceRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </FacebookCardContent>
        </FacebookCard>
      </div>

      {/* Compliance Progress */}
      <FacebookCard>
        <FacebookCardHeader>
          <h3 className="text-lg font-semibold">Group Compliance Overview</h3>
        </FacebookCardHeader>
        <FacebookCardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Overall Compliance Rate
              </span>
              <Badge
                className={
                  getComplianceColor(reportData.complianceRate)
                    .replace("text-", "bg-")
                    .replace("-600", "-100") +
                  " " +
                  getComplianceColor(reportData.complianceRate)
                }
              >
                {reportData.complianceRate >= 90
                  ? "Excellent"
                  : reportData.complianceRate >= 70
                  ? "Good"
                  : "Needs Attention"}
              </Badge>
            </div>
            <Progress value={reportData.complianceRate} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {reportData.activeMembers} out of {reportData.totalMembers}{" "}
              members are actively contributing
            </div>
          </div>
        </FacebookCardContent>
      </FacebookCard>

      {/* Member Breakdown */}
      <FacebookCard>
        <FacebookCardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">
              Member Contribution Breakdown
            </h3>
          </div>
        </FacebookCardHeader>
        <FacebookCardContent>
          {loading ? (
            <div className="py-8 text-center">Loading member data...</div>
          ) : (
            <div className="space-y-3">
              {reportData.memberBreakdown.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.contributions} contributions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {formatCurrency(member.totalAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.complianceRate.toFixed(1)}% compliance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FacebookCardContent>
      </FacebookCard>

      {/* Monthly Trends */}
      {reportData.monthlyTrends.length > 0 && (
        <FacebookCard>
          <FacebookCardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">
                Monthly Contribution Trends
              </h3>
            </div>
          </FacebookCardHeader>
          <FacebookCardContent>
            <div className="space-y-3">
              {reportData.monthlyTrends.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{month.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {formatCurrency(month.totalAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {month.contributions} contributions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FacebookCardContent>
        </FacebookCard>
      )}
    </div>
  );
};

export default GroupContributionReport;
