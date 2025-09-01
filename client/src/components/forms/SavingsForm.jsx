
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Building2, DollarSign, Percent } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import FormField from '../ui/form-field';
import { memberService } from '../../services/memberService';
import { groupService } from '../../services/groupService';

// Validation schema
const savingsSchema = z.object({
  member: z.string().min(1, 'Member is required'),
  group: z.string().optional(),
  initialDeposit: z.number().min(0, 'Initial deposit must be positive').optional(),
  interestRate: z.number().min(0, 'Interest rate must be positive').max(100, 'Interest rate cannot exceed 100%'),
  accountType: z.enum(['individual', 'group'], {
    required_error: 'Account type is required'
  }),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

const SavingsForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      member: initialData?.member?._id || '',
      group: initialData?.group?._id || '',
      initialDeposit: initialData?.balance || 0,
      interestRate: initialData?.interestRate || 5,
      accountType: initialData?.accountType || 'individual',
      description: initialData?.description || '',
      status: initialData?.status || 'active'
    },
    mode: 'onChange'
  });

  const watchedAccountType = watch('accountType');

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if (initialData && isEdit) {
      reset({
        member: initialData.member?._id || '',
        group: initialData.group?._id || '',
        initialDeposit: initialData.balance || 0,
        interestRate: initialData.interestRate || 5,
        accountType: initialData.accountType || 'individual',
        description: initialData.description || '',
        status: initialData.status || 'active'
      });
    }
  }, [initialData, isEdit, reset]);

  const fetchFormData = async () => {
    try {
      setLoadingData(true);
      const [membersResponse, groupsResponse] = await Promise.all([
        memberService.getAll(),
        groupService.getAll()
      ]);

      setMembers(membersResponse.data || membersResponse || []);
      setGroups(groupsResponse.data || groupsResponse || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const onFormSubmit = async (data) => {
    try {
      setLoading(true);
      
      const savingsData = {
        member: data.member,
        group: data.group || null,
        balance: data.initialDeposit || 0,
        interestRate: data.interestRate,
        accountType: data.accountType,
        description: data.description,
        status: data.status
      };

      await onSubmit(savingsData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading form data...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Member Selection */}
        <FormField
          label="Member"
          required
          error={errors.member?.message}
          icon={<User className="h-4 w-4" />}
        >
          <Select 
            value={watch('member')} 
            onValueChange={(value) => setValue('member', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member._id} value={member._id}>
                  {member.name} - {member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Account Type */}
        <FormField
          label="Account Type"
          required
          error={errors.accountType?.message}
        >
          <Select 
            value={watch('accountType')} 
            onValueChange={(value) => setValue('accountType', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual Account</SelectItem>
              <SelectItem value="group">Group Account</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {/* Group Selection (if group account) */}
        {watchedAccountType === 'group' && (
          <FormField
            label="Group"
            error={errors.group?.message}
            icon={<Building2 className="h-4 w-4" />}
          >
            <Select 
              value={watch('group')} 
              onValueChange={(value) => setValue('group', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
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
        )}

        {/* Initial Deposit */}
        <FormField
          label="Initial Deposit"
          error={errors.initialDeposit?.message}
          icon={<DollarSign className="h-4 w-4" />}
        >
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('initialDeposit', { valueAsNumber: true })}
            disabled={loading}
          />
        </FormField>

        {/* Interest Rate */}
        <FormField
          label="Interest Rate (%)"
          required
          error={errors.interestRate?.message}
          icon={<Percent className="h-4 w-4" />}
        >
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="5.0"
            {...register('interestRate', { valueAsNumber: true })}
            disabled={loading}
          />
        </FormField>

        {/* Status */}
        <FormField
          label="Status"
          required
          error={errors.status?.message}
        >
          <Select 
            value={watch('status')} 
            onValueChange={(value) => setValue('status', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Description */}
      <FormField
        label="Description"
        error={errors.description?.message}
      >
        <Textarea
          placeholder="Optional account description or notes..."
          rows={3}
          {...register('description')}
          disabled={loading}
        />
      </FormField>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !isValid}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {isEdit ? 'Update Account' : 'Create Account'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SavingsForm;
