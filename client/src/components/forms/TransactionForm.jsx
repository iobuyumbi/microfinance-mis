import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CreditCard, DollarSign, Loader2, Calendar, User } from "lucide-react";
import { toast } from "sonner";

const TransactionForm = ({ onSubmit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    memberId: "",
    groupId: "",
    status: "pending",
  });

  // Load initial data if provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || "",
        amount: initialData.amount || "",
        description: initialData.description || "",
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        memberId: initialData.memberId || "",
        groupId: initialData.groupId || "",
        status: initialData.status || "pending",
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.type || !formData.amount || !formData.description) {
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
          type: "", 
          amount: "", 
          description: "", 
          date: new Date().toISOString().split('T')[0],
          memberId: "",
          groupId: "",
          status: "pending", 
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error saving transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {initialData ? "Edit Transaction" : "New Transaction"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings_contribution">Savings Contribution</SelectItem>
              <SelectItem value="savings_withdrawal">Savings Withdrawal</SelectItem>
              <SelectItem value="loan_disbursement">Loan Disbursement</SelectItem>
              <SelectItem value="loan_repayment">Loan Repayment</SelectItem>
              <SelectItem value="transfer_in">Transfer In</SelectItem>
              <SelectItem value="transfer_out">Transfer Out</SelectItem>
              <SelectItem value="fee_paid">Fee Payment</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
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
            <Label htmlFor="description">Description</Label>
            <Input
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="memberId">Member ID (if applicable)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter member ID"
                value={formData.memberId}
                onChange={(e) => handleChange("memberId", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="groupId">Group ID (if applicable)</Label>
            <Input
              placeholder="Enter group ID"
              value={formData.groupId}
              onChange={(e) => handleChange("groupId", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              initialData ? "Update Transaction" : "Create Transaction"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
