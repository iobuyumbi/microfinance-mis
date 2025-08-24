/**
 * Unified Transaction List Component
 * Provides consistent display of financial transactions
 * Ensures proper formatting and styling across the application
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { FinancialDisplay } from "../../utils/financialUtils";
import { cn } from "../../lib/utils";

const TransactionList = ({
  transactions = [],
  title = "Recent Transactions",
  showHeader = true,
  maxItems,
  className,
  onTransactionClick,
  emptyMessage = "No transactions found",
  ...props
}) => {
  const displayTransactions = maxItems
    ? transactions.slice(0, maxItems)
    : transactions;

  const getTransactionIcon = (type) => {
    const icons = {
      savings_contribution: "💰",
      savings_withdrawal: "💸",
      loan_disbursement: "📤",
      loan_repayment: "📥",
      interest_earned: "📈",
      interest_charged: "📉",
      penalty_incurred: "⚠️",
      penalty_paid: "✅",
      fee_incurred: "💳",
      fee_paid: "✅",
      transfer_in: "➡️",
      transfer_out: "⬅️",
      refund: "🔄",
      adjustment: "⚖️",
    };
    return icons[type] || "💱";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (!transactions.length) {
    return (
      <Card className={cn("text-center py-8", className)} {...props}>
        <CardContent>
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)} {...props}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {displayTransactions.map((transaction, index) => (
            <div
              key={transaction._id || index}
              className={cn(
                "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150",
                onTransactionClick && "cursor-pointer"
              )}
              onClick={() => onTransactionClick?.(transaction)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {FinancialDisplay.getTransactionTypeLabel(
                          transaction.type
                        )}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          FinancialDisplay.getTransactionTypeColor(
                            transaction.type
                          )
                        )}
                      >
                        {transaction.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {transaction.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      FinancialDisplay.getAmountColor(transaction.type)
                    )}
                  >
                    {FinancialDisplay.formatAmount(transaction.amount)}
                  </div>
                  {transaction.balanceAfter !== undefined && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Balance:{" "}
                      {FinancialDisplay.formatAmount(transaction.balanceAfter)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {maxItems && transactions.length > maxItems && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Showing {maxItems} of {transactions.length} transactions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
