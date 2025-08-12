import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { PiggyBank, Search, Plus, DollarSign, Target } from "lucide-react";
import { toast } from "sonner";
import { savingsService } from "../../services/savingsService";

const SavingsList = () => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSavings();
  }, []);

  const loadSavings = async () => {
    try {
      const data = await savingsService.getAll();
      setSavings(data.data || []);
    } catch (error) {
      console.error("Error loading savings:", error);
      toast.error(error.response?.data?.message || "Failed to load savings");
    } finally {
      setLoading(false);
    }
  };

  const filteredSavings = savings.filter(saving =>
    saving.savingsType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    saving.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Savings Accounts ({savings.length})
          </CardTitle>
          <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Savings
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search savings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredSavings.length === 0 ? (
            <div className="text-center py-8">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No savings accounts found</p>
            </div>
          ) : (
            filteredSavings.map((saving) => (
              <div
                key={saving._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{saving.savingsType}</h3>
                    <p className="text-sm text-muted-foreground">{saving.purpose}</p>
                    <p className="text-sm font-medium">${saving.amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(saving.status)}>
                    {saving.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsList;
