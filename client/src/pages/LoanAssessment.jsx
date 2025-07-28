// src/pages/LoanAssessment.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { groupService } from "@/services/groupService";
import { savingsService } from "@/services/savingsService";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Custom Components
import { PageLayout, ContentCard } from "@/components/layouts/PageLayout";
import { UserAvatar } from "@/components/custom/UserAvatar";
import { StatsCard } from "@/components/custom/StatsCard";

// Lucide React Icons
import {
  Search,
  Calculator,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Shield,
  Target,
  Clock,
} from "lucide-react";

import { toast } from "sonner";

export default function LoanAssessmentPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberGroups, setMemberGroups] = useState([]);
  const [groupSavings, setGroupSavings] = useState(0);
  const [individualSavings, setIndividualSavings] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (
      isAuthenticated &&
      (currentUser?.role === "officer" || currentUser?.role === "admin")
    ) {
      fetchMembers();
    }
  }, [isAuthenticated, currentUser?.role]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      const allMembers = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      // Filter to only show members (not admins/officers)
      const memberUsers = allMembers.filter((user) => user.role === "member");
      setMembers(memberUsers);
    } catch (err) {
      setError(err.message || "Failed to load members");
      toast.error(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = async (memberId) => {
    try {
      setLoading(true);
      const member = members.find((m) => (m._id || m.id) === memberId);
      setSelectedMember(member);

      // Fetch member's groups
      const groupsResponse = await groupService.getUserGroups(memberId);
      const userGroups = Array.isArray(groupsResponse.data)
        ? groupsResponse.data
        : [];
      setMemberGroups(userGroups);

      // Fetch group savings (assuming first group for simplicity)
      if (userGroups.length > 0) {
        const groupId = userGroups[0]._id || userGroups[0].id;
        const savingsResponse = await savingsService.getGroupSavings(groupId);
        const groupSavingsData = Array.isArray(savingsResponse.data)
          ? savingsResponse.data
          : [];
        const totalGroupSavings = groupSavingsData.reduce(
          (sum, saving) => sum + (saving.amount || 0),
          0
        );
        setGroupSavings(totalGroupSavings);

        // Fetch individual savings
        const individualSavingsResponse =
          await savingsService.getUserSavings(memberId);
        const individualSavingsData = Array.isArray(
          individualSavingsResponse.data
        )
          ? individualSavingsResponse.data
          : [];
        const totalIndividualSavings = individualSavingsData.reduce(
          (sum, saving) => sum + (saving.amount || 0),
          0
        );
        setIndividualSavings(totalIndividualSavings);
      }

      // Perform loan assessment
      performLoanAssessment(
        member,
        userGroups,
        totalGroupSavings,
        totalIndividualSavings
      );
    } catch (err) {
      toast.error("Failed to load member details");
    } finally {
      setLoading(false);
    }
  };

  const performLoanAssessment = (
    member,
    groups,
    groupSavings,
    individualSavings
  ) => {
    // Loan assessment rules (configurable)
    const rules = {
      minGroupSavings: 1000, // Minimum group savings required
      minIndividualSavings: 200, // Minimum individual savings required
      maxLoanToGroupSavingsRatio: 0.3, // Max loan = 30% of group savings
      maxLoanToIndividualSavingsRatio: 2, // Max loan = 2x individual savings
      minLoanAmount: 500,
      maxLoanAmount: 10000,
    };

    const assessment = {
      member,
      groupSavings,
      individualSavings,
      eligible: false,
      recommendedAmount: 0,
      maxEligibleAmount: 0,
      reasons: [],
      riskLevel: "high",
    };

    // Check basic eligibility
    if (groupSavings < rules.minGroupSavings) {
      assessment.reasons.push(
        `Group savings ($${groupSavings}) is below minimum requirement ($${rules.minGroupSavings})`
      );
    }

    if (individualSavings < rules.minIndividualSavings) {
      assessment.reasons.push(
        `Individual savings ($${individualSavings}) is below minimum requirement ($${rules.minIndividualSavings})`
      );
    }

    // Calculate maximum eligible amount
    const maxFromGroupSavings = groupSavings * rules.maxLoanToGroupSavingsRatio;
    const maxFromIndividualSavings =
      individualSavings * rules.maxLoanToIndividualSavingsRatio;
    const maxEligibleAmount = Math.min(
      maxFromGroupSavings,
      maxFromIndividualSavings,
      rules.maxLoanAmount
    );

    assessment.maxEligibleAmount = maxEligibleAmount;

    // Determine eligibility
    if (
      assessment.reasons.length === 0 &&
      maxEligibleAmount >= rules.minLoanAmount
    ) {
      assessment.eligible = true;
      assessment.recommendedAmount = Math.min(maxEligibleAmount, 5000); // Conservative recommendation
    }

    // Determine risk level
    if (groupSavings > 5000 && individualSavings > 1000) {
      assessment.riskLevel = "low";
    } else if (groupSavings > 2000 && individualSavings > 500) {
      assessment.riskLevel = "medium";
    } else {
      assessment.riskLevel = "high";
    }

    setAssessmentResult(assessment);
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check access control
  if (!isAuthenticated) {
    return (
      <PageLayout title="Loan Assessment">
        <div className="p-6 text-center text-red-500">
          <Shield className="h-10 w-10 mx-auto mb-4 text-red-400" />
          You must be logged in to access this page.
        </div>
      </PageLayout>
    );
  }

  if (currentUser?.role !== "officer" && currentUser?.role !== "admin") {
    return (
      <PageLayout title="Loan Assessment">
        <div className="p-6 text-center text-red-500">
          <Shield className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: Only officers and administrators can perform loan
          assessments.
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Loan Assessment">
      <div className="space-y-6">
        {/* Member Search */}
        <ContentCard title="Select Member for Assessment">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Members</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {filteredMembers.map((member) => (
                <div
                  key={member._id || member.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                    selectedMember?._id === member._id
                      ? "bg-muted border-primary"
                      : ""
                  }`}
                  onClick={() => handleMemberSelect(member._id || member.id)}
                >
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={member} size="sm" />
                    <div className="flex-1">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {member.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentCard>

        {/* Assessment Results */}
        {selectedMember && assessmentResult && (
          <div className="space-y-6">
            {/* Member Info */}
            <ContentCard title="Member Information">
              <div className="flex items-center space-x-4">
                <UserAvatar user={selectedMember} size="lg" />
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedMember.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedMember.email}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="outline" className="capitalize">
                      {selectedMember.status}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {selectedMember.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </ContentCard>

            {/* Financial Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Group Savings"
                value={`$${groupSavings.toLocaleString()}`}
                description="Total group savings"
                icon={Users}
                className="border-blue-200 bg-blue-50/50"
              />
              <StatsCard
                title="Individual Savings"
                value={`$${individualSavings.toLocaleString()}`}
                description="Member's personal savings"
                icon={DollarSign}
                className="border-green-200 bg-green-50/50"
              />
              <StatsCard
                title="Risk Level"
                value={assessmentResult.riskLevel.toUpperCase()}
                description="Loan risk assessment"
                icon={
                  assessmentResult.riskLevel === "low"
                    ? CheckCircle
                    : AlertCircle
                }
                className={
                  assessmentResult.riskLevel === "low"
                    ? "border-green-200 bg-green-50/50"
                    : assessmentResult.riskLevel === "medium"
                      ? "border-yellow-200 bg-yellow-50/50"
                      : "border-red-200 bg-red-50/50"
                }
              />
            </div>

            {/* Assessment Results */}
            <ContentCard title="Loan Assessment Results">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {assessmentResult.eligible ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <h4 className="font-semibold">
                        {assessmentResult.eligible
                          ? "Eligible for Loan"
                          : "Not Eligible for Loan"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Based on current financial position
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      assessmentResult.eligible ? "default" : "destructive"
                    }
                    className="text-lg px-4 py-2"
                  >
                    {assessmentResult.eligible ? "APPROVED" : "DECLINED"}
                  </Badge>
                </div>

                {assessmentResult.eligible && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="h-5 w-5" />
                          <span>Recommended Amount</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          ${assessmentResult.recommendedAmount.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Conservative loan recommendation based on savings and
                          risk assessment
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5" />
                          <span>Maximum Eligible</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          ${assessmentResult.maxEligibleAmount.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Maximum loan amount based on current financial
                          position
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {assessmentResult.reasons.length > 0 && (
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <span>Reasons for Ineligibility</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {assessmentResult.reasons.map((reason, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-red-700">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ContentCard>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
