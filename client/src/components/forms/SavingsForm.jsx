import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PiggyBank, DollarSign } from "lucide-react";
import { toast } from "sonner";

const SavingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    savingsType: "",
    amount: "",
    frequency: "",
    purpose: "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Savings account created!");
        setFormData({ savingsType: "", amount: "", frequency: "", purpose: "" });
      } else {
        toast.error("Failed to create savings account");
      }
    } catch (error) {
      toast.error("Error creating savings account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Create Savings Account
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

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SavingsForm;
