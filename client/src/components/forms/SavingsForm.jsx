import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PiggyBank, DollarSign, Loader2, User } from "lucide-react";
import { toast } from "sonner";

const SavingsForm = ({ onSubmit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    savingsType: "",
    amount: "",
    frequency: "",
    purpose: "",
    owner: "",
    ownerModel: "User",
  });

  // Load initial data if provided (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        savingsType: initialData.savingsType || "",
        amount: initialData.amount || "",
        frequency: initialData.frequency || "",
        purpose: initialData.purpose || "",
        owner: initialData.owner || "",
        ownerModel: initialData.ownerModel || "User",
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.savingsType || !formData.amount || !formData.frequency) {
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
          savingsType: "", 
          amount: "", 
          frequency: "", 
          purpose: "",
          owner: "",
          ownerModel: "User", 
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error saving account information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          {initialData ? "Edit Savings Account" : "Create Savings Account"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="savingsType">Savings Type</Label>
            <Select value={formData.savingsType} onValueChange={(value) => handleChange("savingsType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select savings type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Savings</SelectItem>
                <SelectItem value="goal">Goal Savings</SelectItem>
                <SelectItem value="emergency">Emergency Fund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Initial Amount ($)</Label>
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
            <Label htmlFor="frequency">Contribution Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value) => handleChange("frequency", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              placeholder="Describe savings purpose..."
              value={formData.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="owner">Account Owner</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter owner ID"
                value={formData.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ownerModel">Owner Type</Label>
            <Select value={formData.ownerModel} onValueChange={(value) => handleChange("ownerModel", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">Individual Member</SelectItem>
                <SelectItem value="Group">Group</SelectItem>
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
              initialData ? "Update Account" : "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SavingsForm;
