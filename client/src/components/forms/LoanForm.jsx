
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { CalendarDays, DollarSign, Percent, Clock, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../services/userService';
import { groupService } from '../../services/groupService';
import FormField from '../ui/form-field';

const loanSchema = z.object({
  borrower: z.string().min(1, 'Borrower is required'),
  group: z.string().min(1, 'Group is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  interestRate: z.number().min(0).max(100, 'Interest rate must be between 0-100%'),
  term: z.number().min(1, 'Term must be at least 1 month'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  guarantors: z.array(z.string()).optional(),
  collateral: z.string().optional(),
  monthlyIncome: z.number().min(0, 'Monthly income must be 0 or greater'),
  monthlyExpenses: z.number().min(0, 'Monthly expenses must be 0 or greater'),
});

export default function LoanForm({ loan, onSubmit, onCancel }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      borrower: loan?.borrower?._id || '',
      group: loan?.group?._id || '',
      amount: loan?.amount || 0,
      interestRate: loan?.interestRate || 15,
      term: loan?.term || 12,
      purpose: loan?.purpose || '',
      guarantors: loan?.guarantors?.map(g => g._id) || [],
      collateral: loan?.collateral || '',
      monthlyIncome: loan?.monthlyIncome || 0,
      monthlyExpenses: loan?.monthlyExpenses || 0,
    }
  });

  const watchedAmount = watch('amount');
  const watchedInterestRate = watch('interestRate');
  const watchedTerm = watch('term');
  const watchedIncome = watch('monthlyIncome');
  const watchedExpenses = watch('monthlyExpenses');

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data?.users || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await groupService.getAllGroups();
      setGroups(response.data?.groups || response.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    }
  };

  const calculateMonthlyPayment = () => {
    if (!watchedAmount || !watchedInterestRate || !watchedTerm) return 0;
    
    const principal = parseFloat(watchedAmount);
    const monthlyRate = parseFloat(watchedInterestRate) / 100 / 12;
    const numPayments = parseInt(watchedTerm);
    
    if (monthlyRate === 0) {
      return principal / numPayments;
    }
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                   (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return payment;
  };

  const calculateTotalPayment = () => {
    return calculateMonthlyPayment() * watchedTerm;
  };

  const calculateDebtToIncomeRatio = () => {
    if (!watchedIncome || watchedIncome === 0) return 0;
    const monthlyPayment = calculateMonthlyPayment();
    const totalMonthlyObligations = parseFloat(watchedExpenses) + monthlyPayment;
    return (totalMonthlyObligations / parseFloat(watchedIncome)) * 100;
  };

  const getRiskLevel = () => {
    const ratio = calculateDebtToIncomeRatio();
    if (ratio <= 30) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (ratio <= 40) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };

  const onSubmitForm = async (data) => {
    try {
      setLoading(true);
      
      // Calculate repayment schedule
      const monthlyPayment = calculateMonthlyPayment();
      const repaymentSchedule = [];
      const startDate = new Date();
      
      for (let i = 1; i <= data.term; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        repaymentSchedule.push({
          installmentNumber: i,
          dueDate: dueDate.toISOString(),
          amount: monthlyPayment,
          status: 'pending'
        });
      }

      const loanData = {
        ...data,
        monthlyPayment,
        totalAmount: calculateTotalPayment(),
        repaymentSchedule,
        debtToIncomeRatio: calculateDebtToIncomeRatio(),
        riskLevel: getRiskLevel().level.toLowerCase()
      };

      await onSubmit(loanData);
    } catch (error) {
      console.error('Error submitting loan:', error);
      toast.error('Failed to submit loan application');
    } finally {
      setLoading(false);
    }
  };

  const borrowers = users.filter(user => user.role === 'member');
  const potentialGuarantors = users.filter(user => 
    user.role === 'member' && user._id !== watch('borrower')
  );

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Borrower"
              error={errors.borrower}
              required
            >
              <Select onValueChange={(value) => setValue('borrower', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select borrower" />
                </SelectTrigger>
                <SelectContent>
                  {borrowers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Group"
              error={errors.group}
              required
            >
              <Select onValueChange={(value) => setValue('group', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Loan Purpose"
              error={errors.purpose}
              required
            >
              <Textarea
                {...register('purpose')}
                placeholder="Describe the purpose of this loan..."
                rows={3}
              />
            </FormField>

            <FormField
              label="Collateral (Optional)"
              error={errors.collateral}
            >
              <Textarea
                {...register('collateral')}
                placeholder="Describe any collateral offered..."
                rows={2}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Loan Amount ($)"
              error={errors.amount}
              required
            >
              <Input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </FormField>

            <FormField
              label="Interest Rate (%)"
              error={errors.interestRate}
              required
            >
              <Input
                type="number"
                step="0.1"
                {...register('interestRate', { valueAsNumber: true })}
                placeholder="15.0"
              />
            </FormField>

            <FormField
              label="Term (Months)"
              error={errors.term}
              required
            >
              <Input
                type="number"
                {...register('term', { valueAsNumber: true })}
                placeholder="12"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Monthly Income ($)"
                error={errors.monthlyIncome}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('monthlyIncome', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </FormField>

              <FormField
                label="Monthly Expenses ($)"
                error={errors.monthlyExpenses}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('monthlyExpenses', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Calculation Summary */}
      {watchedAmount > 0 && watchedInterestRate >= 0 && watchedTerm > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Loan Calculation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${calculateMonthlyPayment().toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Payment</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${calculateTotalPayment().toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Payment</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${(calculateTotalPayment() - watchedAmount).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Interest</div>
              </div>
            </div>

            {watchedIncome > 0 && (
              <div className="mt-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Debt-to-Income Ratio:</span>
                  <Badge className={getRiskLevel().color}>
                    {getRiskLevel().level} Risk
                  </Badge>
                </div>
                <div className="text-lg font-bold">
                  {calculateDebtToIncomeRatio().toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Recommended: Below 30% for low risk
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guarantors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Guarantors (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {potentialGuarantors.map((user) => (
              <div key={user._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`guarantor-${user._id}`}
                  value={user._id}
                  {...register('guarantors')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`guarantor-${user._id}`} className="flex-1">
                  {user.name} - {user.email}
                </Label>
              </div>
            ))}
            {potentialGuarantors.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No available guarantors found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || loading}
          className="min-w-[120px]"
        >
          {isSubmitting || loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {loan ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            loan ? 'Update Loan' : 'Create Loan'
          )}
        </Button>
      </div>
    </form>
  );
}
