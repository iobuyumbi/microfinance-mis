/**
 * Unified Financial Form Component
 * Provides consistent form handling for financial operations
 * Ensures proper validation and error handling across the application
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Textarea } from "./textarea";
import {
  FinancialValidation,
  FinancialConstants,
} from "../../utils/financialUtils";
import { cn } from "../../lib/utils";

const FinancialForm = ({
  title,
  type = "contribution", // contribution, withdrawal, loan, repayment
  onSubmit,
  onCancel,
  initialData = {},
  loading = false,
  className,
  ...props
}) => {
  const [formData, setFormData] = useState({
    amount: initialData.amount || "",
    description: initialData.description || "",
    paymentMethod: initialData.paymentMethod || "mobile",
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formConfigs = {
    contribution: {
      title: "Make Contribution",
      amountLabel: "Contribution Amount",
      amountPlaceholder: "Enter amount to contribute",
      submitLabel: "Contribute",
      validation: (data) =>
        FinancialValidation.validateAmount(
          data.amount,
          FinancialConstants.MIN_LOAN_AMOUNT,
          FinancialConstants.MAX_LOAN_AMOUNT
        ),
    },
    withdrawal: {
      title: "Make Withdrawal",
      amountLabel: "Withdrawal Amount",
      amountPlaceholder: "Enter amount to withdraw",
      submitLabel: "Withdraw",
      validation: (data) =>
        FinancialValidation.validateAmount(
          data.amount,
          FinancialConstants.MIN_LOAN_AMOUNT,
          FinancialConstants.MAX_LOAN_AMOUNT
        ),
    },
    loan: {
      title: "Apply for Loan",
      amountLabel: "Loan Amount",
      amountPlaceholder: "Enter loan amount",
      submitLabel: "Apply for Loan",
      validation: (data) => {
        const amountValidation = FinancialValidation.validateAmount(
          data.amount,
          FinancialConstants.MIN_LOAN_AMOUNT,
          FinancialConstants.MAX_LOAN_AMOUNT
        );
        if (!amountValidation.isValid) return amountValidation;

        const rateValidation = FinancialValidation.validateInterestRate(
          data.interestRate,
          FinancialConstants.MAX_INTEREST_RATE
        );
        if (!rateValidation.isValid) return rateValidation;

        const termValidation = FinancialValidation.validateLoanTerm(
          data.loanTerm,
          FinancialConstants.MIN_LOAN_TERM,
          FinancialConstants.MAX_LOAN_TERM
        );
        if (!termValidation.isValid) return termValidation;

        return { isValid: true };
      },
    },
    repayment: {
      title: "Make Repayment",
      amountLabel: "Repayment Amount",
      amountPlaceholder: "Enter repayment amount",
      submitLabel: "Repay",
      validation: (data) =>
        FinancialValidation.validateAmount(
          data.amount,
          0.01,
          FinancialConstants.MAX_LOAN_AMOUNT
        ),
    },
  };

  const config = formConfigs[type];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic required field validation
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    }

    if (!formData.description && type !== "repayment") {
      newErrors.description = "Description is required";
    }

    // Financial validation
    if (config.validation) {
      const validation = config.validation(formData);
      if (!validation.isValid) {
        newErrors.amount = validation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAmountField = () => (
    <div className="space-y-2">
      <Label htmlFor="amount">{config.amountLabel}</Label>
      <Input
        id="amount"
        type="number"
        placeholder={config.amountPlaceholder}
        value={formData.amount}
        onChange={(e) =>
          handleInputChange("amount", parseFloat(e.target.value) || "")
        }
        className={cn(errors.amount && "border-red-500")}
        min="0"
        step="0.01"
      />
      {errors.amount && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors.amount}
        </p>
      )}
    </div>
  );

  const renderDescriptionField = () => (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        placeholder="Enter description for this transaction"
        value={formData.description}
        onChange={(e) => handleInputChange("description", e.target.value)}
        className={cn(errors.description && "border-red-500")}
        rows={3}
      />
      {errors.description && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors.description}
        </p>
      )}
    </div>
  );

  const renderPaymentMethodField = () => (
    <div className="space-y-2">
      <Label htmlFor="paymentMethod">Payment Method</Label>
      <Select
        value={formData.paymentMethod}
        onValueChange={(value) => handleInputChange("paymentMethod", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mobile">Mobile Money</SelectItem>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="bank">Bank Transfer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderLoanFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="interestRate">Interest Rate (%)</Label>
        <Input
          id="interestRate"
          type="number"
          placeholder="Enter interest rate"
          value={formData.interestRate || ""}
          onChange={(e) =>
            handleInputChange("interestRate", parseFloat(e.target.value) || "")
          }
          min="0"
          max="100"
          step="0.1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="loanTerm">Loan Term (months)</Label>
        <Input
          id="loanTerm"
          type="number"
          placeholder="Enter loan term in months"
          value={formData.loanTerm || ""}
          onChange={(e) =>
            handleInputChange("loanTerm", parseInt(e.target.value) || "")
          }
          min="1"
          max="360"
        />
      </div>
    </>
  );

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)} {...props}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderAmountField()}

          {type === "loan" && renderLoanFields()}

          {type !== "repayment" && renderDescriptionField()}

          {renderPaymentMethodField()}

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? "Processing..." : config.submitLabel}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialForm;
