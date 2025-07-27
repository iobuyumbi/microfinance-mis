import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  User,
  Building,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

// Mock service for loan assessment
const loanAssessmentService = {
  async getMemberData(memberId) {
    // Mock API call - replace with actual endpoint
    return {
      member: {
        _id: memberId,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
      },
      groups: [
        {
          _id: "group1",
          name: "Savings Group A",
          totalSavings: 50000,
          memberSavings: 5000,
        },
        {
          _id: "group2",
          name: "Investment Group B",
          totalSavings: 75000,
          memberSavings: 3000,
        },
      ],
      individualSavings: 8000,
      loanHistory: [
        { amount: 2000, status: "paid", date: "2023-01-15" },
        { amount: 1500, status: "paid", date: "2023-06-20" },
      ],
    };
  },
};

export default function LoanAssessment() {
  const { user: currentUser } = useAuth();
  const [selectedMember, setSelectedMember] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);

  // Mock member list - replace with actual data
  const mockMembers = [
    { _id: "member1", name: "John Doe", email: "john@example.com" },
    { _id: "member2", name: "Jane Smith", email: "jane@example.com" },
    { _id: "member3", name: "Bob Johnson", email: "bob@example.com" },
  ];

  const calculateEligibility = (memberData) => {
    if (!memberData) return null;

    const { groups, individualSavings, loanHistory } = memberData;

    // Calculate total group savings
    const totalGroupSavings = groups.reduce(
      (sum, group) => sum + group.totalSavings,
      0
    );

    // Calculate member's total savings in groups
    const memberGroupSavings = groups.reduce(
      (sum, group) => sum + group.memberSavings,
      0
    );

    // Total member savings (individual + group)
    const totalMemberSavings = individualSavings + memberGroupSavings;

    // Assessment criteria
    const minGroupSavings = 10000; // Minimum group savings required
    const minIndividualSavings = 2000; // Minimum individual savings required
    const maxLoanRatio = 0.3; // Maximum loan amount as ratio of total savings

    // Check eligibility
    const isEligible =
      totalGroupSavings >= minGroupSavings &&
      individualSavings >= minIndividualSavings;

    // Calculate recommended loan amount
    const maxLoanAmount = totalMemberSavings * maxLoanRatio;
    const recommendedLoanAmount = Math.min(maxLoanAmount, 10000); // Cap at 10,000

    // Risk assessment
    let riskLevel = "low";
    if (totalMemberSavings < 5000) riskLevel = "high";
    else if (totalMemberSavings < 8000) riskLevel = "medium";

    return {
      isEligible,
      totalGroupSavings,
      totalMemberSavings,
      recommendedLoanAmount,
      riskLevel,
      criteria: {
        minGroupSavings,
        minIndividualSavings,
        maxLoanRatio,
      },
    };
  };

  const handleMemberSelect = async (memberId) => {
    if (!memberId) {
      setMemberData(null);
      setAssessment(null);
      return;
    }

    setLoading(true);
    try {
      const data = await loanAssessmentService.getMemberData(memberId);
      setMemberData(data);
      const assessmentResult = calculateEligibility(data);
      setAssessment(assessmentResult);
    } catch (error) {
      toast.error("Failed to load member data");
      console.error("Error loading member data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMember) {
      handleMemberSelect(selectedMember);
    }
  }, [selectedMember]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loan Assessment</h2>
          <p className="text-muted-foreground">
            Assess member eligibility for loans based on savings and group
            performance
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Officer Access Only
        </Badge>
      </div>

      {/* Member Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Member for Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member">Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member to assess" />
                </SelectTrigger>
                <SelectContent>
                  {mockMembers.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Results */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading member data...</span>
          </CardContent>
        </Card>
      )}

      {memberData && assessment && (
        <div className="space-y-6">
          {/* Member Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Member Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-lg">{memberData.member.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-lg">{memberData.member.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-lg">{memberData.member.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Savings Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${assessment.totalGroupSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Group Savings
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${assessment.totalMemberSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Member Savings
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${memberData.individualSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Individual Savings
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Assessment Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Eligibility Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {assessment.isEligible ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {assessment.isEligible
                          ? "Eligible for Loan"
                          : "Not Eligible for Loan"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Based on savings criteria and group performance
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      assessment.isEligible
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {assessment.isEligible ? "APPROVED" : "DECLINED"}
                  </Badge>
                </div>

                {/* Risk Assessment */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                    <div>
                      <div className="font-semibold">Risk Level</div>
                      <div className="text-sm text-muted-foreground">
                        Based on total savings and loan history
                      </div>
                    </div>
                  </div>
                  <Badge className={getRiskColor(assessment.riskLevel)}>
                    {assessment.riskLevel.toUpperCase()}
                  </Badge>
                </div>

                {/* Recommended Loan Amount */}
                {assessment.isEligible && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-semibold">
                          Recommended Loan Amount
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Maximum recommended based on savings ratio
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${assessment.recommendedLoanAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Max: $
                        {(
                          assessment.totalMemberSavings *
                          assessment.criteria.maxLoanRatio
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assessment Criteria */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold mb-2">Assessment Criteria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Min Group Savings:</span> $
                      {assessment.criteria.minGroupSavings.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">
                        Min Individual Savings:
                      </span>{" "}
                      $
                      {assessment.criteria.minIndividualSavings.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Max Loan Ratio:</span>{" "}
                      {(assessment.criteria.maxLoanRatio * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Group Memberships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberData.groups.map((group) => (
                  <div
                    key={group._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{group.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Member Savings: ${group.memberSavings.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${group.totalSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Group Savings
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {!selectedMember && (
        <Card>
          <CardContent className="text-center py-8">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Loan Assessment Tool</h3>
            <p className="text-muted-foreground">
              Select a member above to assess their loan eligibility based on
              their savings, group performance, and financial history.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
