import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";

const LoanForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loanType: "",
    amount: "",
    purpose: "",
    duration: "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Loan application submitted!");
        setFormData({ loanType: "", amount: "", purpose: "", duration: "" });
      } else {
        toast.error("Failed to submit application");
      }
    } catch (error) {
      toast.error("Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Apply for Loan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="loanType">Loan Type</Label>
            <Select value={formData.loanType} onValueChange={(value) => handleChange("loanType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business Loan</SelectItem>
                <SelectItem value="personal">Personal Loan</SelectItem>
                <SelectItem value="education">Education Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              placeholder="Describe loan purpose..."
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (months)</Label>
            <Input
              type="number"
              placeholder="Enter duration"
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoanForm;
