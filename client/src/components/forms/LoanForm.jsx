import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DollarSign, FileText, Loader2, Calendar, User } from "lucide-react";
import { toast } from "sonner";

const LoanForm = ({ onSubmit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loanType: "",
    amount: "",
    purpose: "",
    duration: "",
    interestRate: "",
    applicant: "",
  });

  // Load initial data if provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        loanType: initialData.loanType || "",
        amount: initialData.amount || "",
        purpose: initialData.purpose || "",
        duration: initialData.duration || "",
        interestRate: initialData.interestRate || "",
        applicant: initialData.applicant || "",
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.loanType || !formData.amount || !formData.purpose || !formData.duration) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);

    try {
      // Use the onSubmit prop to handle form submission
      await onSubmit(formData);
      
      // Only reset form if not in edit mode
      if (!initialData) {
        setFormData({ 
          loanType: "", 
          amount: "", 
          purpose: "", 
          duration: "",
          interestRate: "",
          applicant: "", 
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting loan application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {initialData ? "Edit Loan Application" : "Apply for Loan"}
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
            <Label htmlFor="applicant">Applicant Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter applicant name"
                value={formData.applicant}
                onChange={(e) => handleChange("applicant", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="Enter interest rate"
              value={formData.interestRate}
              onChange={(e) => handleChange("interestRate", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (months)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Enter duration in months"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Submitting..."}
              </>
            ) : (
              initialData ? "Update Application" : "Submit Application"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoanForm;
