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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import {
  User,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  Download,
} from "lucide-react";
import { contributionService } from "../../services/contributionService";

const MemberContributionCard = ({ member, group }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [stats, setStats] = useState({
    totalContributed: 0,
    totalContributions: 0,
    lastContribution: null,
    averageContribution: 0,
    complianceRate: 0,
  });

  useEffect(() => {
    if (member && group) {
      fetchMemberContributions();
    }
  }, [member, group]);

  const fetchMemberContributions = async () => {
    try {
      setLoading(true);
      const response = await contributionService.getByMember(member._id, {
        groupId: group._id,
      });
      const memberContributions = response.data.data || [];
      setContributions(memberContributions);
      calculateMemberStats(memberContributions);
    } catch (error) {
      console.error("Error fetching member contributions:", error);
      toast.error("Failed to load member contributions");
    } finally {
      setLoading(false);
    }
  };

  const calculateMemberStats = (contributions) => {
    const totalContributed = contributions.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
    const totalContributions = contributions.length;
    const averageContribution =
      totalContributions > 0 ? totalContributed / totalContributions : 0;
    const lastContribution = contributions.length > 0 ? contributions[0] : null;

    // Calculate compliance rate (assuming monthly contributions)
    const monthsSinceJoining = Math.max(
      1,
      Math.floor(
        (new Date() - new Date(member.createdAt || Date.now())) /
          (1000 * 60 * 60 * 24 * 30)
      )
    );
    const complianceRate = Math.min(
      100,
      (totalContributions / monthsSinceJoining) * 100
    );

    setStats({
      totalContributed,
      totalContributions,
      lastContribution,
      averageContribution,
      complianceRate,
    });
  };

  const exportMemberHistory = async () => {
    try {
      const response = await contributionService.export({
        memberId: member._id,
        groupId: group._id,
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contributions-${member.name}-${group.name}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Member history exported successfully");
    } catch (error) {
      console.error("Error exporting member history:", error);
      toast.error("Failed to export member history");
    }
  };

  const getStatusColor = (complianceRate) => {
    if (complianceRate >= 90) return "bg-green-100 text-green-800";
    if (complianceRate >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusText = (complianceRate) => {
    if (complianceRate >= 90) return "Excellent";
    if (complianceRate >= 70) return "Good";
    return "Needs Attention";
  };

  return (
    <FacebookCard>
      <FacebookCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">
                Member of {group.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button variant="outline" size="sm" onClick={exportMemberHistory}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </FacebookCardHeader>
      <FacebookCardContent>
        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${stats.totalContributed.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Contributed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalContributions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Contributions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${stats.averageContribution.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.complianceRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Compliance</div>
              </div>
            </div>

            {/* Compliance Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compliance Rate</span>
                <Badge className={getStatusColor(stats.complianceRate)}>
                  {getStatusText(stats.complianceRate)}
                </Badge>
              </div>
              <Progress value={stats.complianceRate} className="h-2" />
            </div>

            {/* Last Contribution */}
            {stats.lastContribution && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Last Contribution:</span>
                  <span>
                    {new Date(
                      stats.lastContribution.createdAt
                    ).toLocaleDateString()}
                  </span>
                  <span className="text-green-600 font-medium">
                    ${stats.lastContribution.amount}
                  </span>
                </div>
              </div>
            )}

            {/* Recent Contributions */}
            <div>
              <h4 className="font-medium mb-2">Recent Contributions</h4>
              <div className="space-y-2">
                {contributions.slice(0, 3).map((contribution) => (
                  <div
                    key={contribution._id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        ${contribution.amount}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </FacebookCardContent>

      {/* Contribution History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Contribution History - {member.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution._id}>
                    <TableCell>
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${contribution.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {contribution.paymentMethod || "cash"}
                    </TableCell>
                    <TableCell>
                      {contribution.description || "Contribution"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          contribution.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {contribution.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </FacebookCard>
  );
};

export default MemberContributionCard;
