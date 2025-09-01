
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
import { DollarSign, User, FileText, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../services/userService';
import { groupService } from '../../services/groupService';
import FormField from '../ui/form-field';

const transactionSchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'loan_repayment', 'interest', 'fee'], {
    required_error: 'Transaction type is required'
  }),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  member: z.string().min(1, 'Member is required'),
  group: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'mobile_money', 'cheque']).optional(),
});

export default function TransactionForm({ transaction, onSubmit, onCancel }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'deposit',
      amount: transaction?.amount || 0,
      member: transaction?.member?._id || '',
      group: transaction?.group?._id || '',
      description: transaction?.description || '',
      reference: transaction?.reference || '',
      paymentMethod: transaction?.paymentMethod || 'cash',
    }
  });

  const watchedType = watch('type');
  const watchedAmount = watch('amount');

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

  const generateReference = () => {
    const type = watchedType?.toUpperCase() || 'TXN';
    const timestamp = Date.now().toString().slice(-6);
    return `${type}-${timestamp}`;
  };

  const onSubmitForm = async (data) => {
    try {
      setLoading(true);
      
      const transactionData = {
        ...data,
        reference: data.reference || generateReference(),
        status: 'pending' // New transactions start as pending
      };

      await onSubmit(transactionData);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      toast.error('Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  const members = users.filter(user => user.role === 'member');

  const getTransactionTypeDescription = (type) => {
    const descriptions = {
      deposit: 'Money coming into the account',
      withdrawal: 'Money going out of the account',
      loan_repayment: 'Payment towards a loan',
      interest: 'Interest earned or charged',
      fee: 'Service or processing fee'
    };
    return descriptions[type] || '';
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Transaction Type"
              error={errors.type}
              required
            >
              <Select onValueChange={(value) => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">
                    <div>
                      <div className="font-medium">Deposit</div>
                      <div className="text-xs text-muted-foreground">Money coming in</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="withdrawal">
                    <div>
                      <div className="font-medium">Withdrawal</div>
                      <div className="text-xs text-muted-foreground">Money going out</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="loan_repayment">
                    <div>
                      <div className="font-medium">Loan Repayment</div>
                      <div className="text-xs text-muted-foreground">Payment towards loan</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="interest">
                    <div>
                      <div className="font-medium">Interest</div>
                      <div className="text-xs text-muted-foreground">Interest earned/charged</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="fee">
                    <div>
                      <div className="font-medium">Fee</div>
                      <div className="text-xs text-muted-foreground">Service fee</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Amount ($)"
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
              label="Payment Method"
              error={errors.paymentMethod}
            >
              <Select onValueChange={(value) => setValue('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Reference Number"
              error={errors.reference}
            >
              <div className="flex gap-2">
                <Input
                  {...register('reference')}
                  placeholder="Auto-generated if empty"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValue('reference', generateReference())}
                >
                  Generate
                </Button>
              </div>
            </FormField>
          </CardContent>
        </Card>

        {/* Member & Group Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Member & Group
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Member"
              error={errors.member}
              required
            >
              <Select onValueChange={(value) => setValue('member', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Group (Optional)"
              error={errors.group}
            >
              <Select onValueChange={(value) => setValue('group', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Group</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Description"
              error={errors.description}
              required
            >
              <Textarea
                {...register('description')}
                placeholder="Describe the transaction..."
                rows={4}
              />
            </FormField>

            {watchedType && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {getTransactionTypeDescription(watchedType)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Preview */}
      {watchedAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${watchedAmount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-muted-foreground">Transaction Amount</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {watchedType?.replace('_', ' ').toUpperCase() || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Transaction Type</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  PENDING
                </div>
                <div className="text-sm text-muted-foreground">Initial Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {transaction ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            transaction ? 'Update Transaction' : 'Create Transaction'
          )}
        </Button>
      </div>
    </form>
  );
}
