import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { CreditCard, Search, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (type) => {
    switch (type) {
      case "deposit": return "bg-green-100 text-green-800";
      case "withdrawal": return "bg-red-100 text-red-800";
      case "transfer": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAmountColor = (type) => {
    switch (type) {
      case "deposit": return "text-green-600";
      case "withdrawal": return "text-red-600";
      case "transfer": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "deposit": return TrendingUp;
      case "withdrawal": return TrendingDown;
      case "transfer": return CreditCard;
      default: return CreditCard;
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
            <CreditCard className="h-5 w-5" />
            Transactions ({transactions.length})
          </CardTitle>
          <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const TransactionIcon = getIcon(transaction.type);
              return (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(transaction.type)}`}>
                      <TransactionIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{transaction.type}</h3>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      <p className={`text-sm font-medium ${getAmountColor(transaction.type)}`}>
                        ${transaction.amount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
