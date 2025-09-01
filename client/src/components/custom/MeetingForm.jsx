
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Calendar, Clock, Users, MapPin, FileText } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import FormField from '../ui/form-field';
import { groupService } from '../../services/groupService';

// Validation schema
const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  group: z.string().min(1, 'Group is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  agenda: z.string().optional(),
  type: z.enum(['regular', 'special', 'emergency'], {
    required_error: 'Meeting type is required'
  }),
  expectedDuration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['weekly', 'biweekly', 'monthly']).optional()
});

const MeetingForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}) => {
  const [loading, setLoading] = useState(false);
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
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: initialData?.title || '',
      group: initialData?.group?._id || '',
      scheduledDate: initialData?.scheduledDate ? 
        new Date(initialData.scheduledDate).toISOString().split('T')[0] : '',
      scheduledTime: initialData?.scheduledDate ? 
        new Date(initialData.scheduledDate).toTimeString().slice(0, 5) : '',
      location: initialData?.location || '',
      description: initialData?.description || '',
      agenda: initialData?.agenda || '',
      type: initialData?.type || 'regular',
      expectedDuration: initialData?.expectedDuration || 60,
      isRecurring: initialData?.isRecurring || false,
      recurringPattern: initialData?.recurringPattern || 'weekly'
    },
    mode: 'onChange'
  });

  const watchedIsRecurring = watch('isRecurring');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (initialData && isEdit) {
      reset({
        title: initialData.title || '',
        group: initialData.group?._id || '',
        scheduledDate: initialData.scheduledDate ? 
          new Date(initialData.scheduledDate).toISOString().split('T')[0] : '',
        scheduledTime: initialData.scheduledDate ? 
          new Date(initialData.scheduledDate).toTimeString().slice(0, 5) : '',
        location: initialData.location || '',
        description: initialData.description || '',
        agenda: initialData.agenda || '',
        type: initialData.type || 'regular',
        expectedDuration: initialData.expectedDuration || 60,
        isRecurring: initialData.isRecurring || false,
        recurringPattern: initialData.recurringPattern || 'weekly'
      });
    }
  }, [initialData, isEdit, reset]);

  const fetchGroups = async () => {
    try {
      setLoadingData(true);
      const response = await groupService.getAll();
      setGroups(response.data || response || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoadingData(false);
    }
  };

  const onFormSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Combine date and time
      const scheduledDate = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      
      const meetingData = {
        title: data.title,
        group: data.group,
        scheduledDate: scheduledDate.toISOString(),
        location: data.location,
        description: data.description,
        agenda: data.agenda,
        type: data.type,
        expectedDuration: data.expectedDuration,
        isRecurring: data.isRecurring,
        recurringPattern: data.isRecurring ? data.recurringPattern : undefined
      };

      await onSubmit(meetingData);
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
        {/* Meeting Title */}
        <FormField
          label="Meeting Title"
          required
          error={errors.title?.message}
          icon={<FileText className="h-4 w-4" />}
        >
          <Input
            placeholder="e.g., Weekly Group Meeting"
            {...register('title')}
            disabled={loading}
          />
        </FormField>

        {/* Meeting Type */}
        <FormField
          label="Meeting Type"
          required
          error={errors.type?.message}
        >
          <Select 
            value={watch('type')} 
            onValueChange={(value) => setValue('type', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select meeting type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular Meeting</SelectItem>
              <SelectItem value="special">Special Meeting</SelectItem>
              <SelectItem value="emergency">Emergency Meeting</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {/* Group Selection */}
        <FormField
          label="Group"
          required
          error={errors.group?.message}
          icon={<Users className="h-4 w-4" />}
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

        {/* Expected Duration */}
        <FormField
          label="Expected Duration (minutes)"
          required
          error={errors.expectedDuration?.message}
          icon={<Clock className="h-4 w-4" />}
        >
          <Input
            type="number"
            min="15"
            max="480"
            placeholder="60"
            {...register('expectedDuration', { valueAsNumber: true })}
            disabled={loading}
          />
        </FormField>

        {/* Meeting Date */}
        <FormField
          label="Meeting Date"
          required
          error={errors.scheduledDate?.message}
          icon={<Calendar className="h-4 w-4" />}
        >
          <Input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register('scheduledDate')}
            disabled={loading}
          />
        </FormField>

        {/* Meeting Time */}
        <FormField
          label="Meeting Time"
          required
          error={errors.scheduledTime?.message}
          icon={<Clock className="h-4 w-4" />}
        >
          <Input
            type="time"
            {...register('scheduledTime')}
            disabled={loading}
          />
        </FormField>
      </div>

      {/* Location */}
      <FormField
        label="Location"
        required
        error={errors.location?.message}
        icon={<MapPin className="h-4 w-4" />}
      >
        <Input
          placeholder="Meeting location or address"
          {...register('location')}
          disabled={loading}
        />
      </FormField>

      {/* Description */}
      <FormField
        label="Description"
        error={errors.description?.message}
      >
        <Textarea
          placeholder="Brief description of the meeting purpose..."
          rows={3}
          {...register('description')}
          disabled={loading}
        />
      </FormField>

      {/* Agenda */}
      <FormField
        label="Agenda"
        error={errors.agenda?.message}
      >
        <Textarea
          placeholder="Meeting agenda items..."
          rows={4}
          {...register('agenda')}
          disabled={loading}
        />
      </FormField>

      {/* Recurring Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecurring"
            {...register('isRecurring')}
            disabled={loading}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isRecurring">
            This is a recurring meeting
          </Label>
        </div>

        {watchedIsRecurring && (
          <FormField
            label="Recurring Pattern"
            error={errors.recurringPattern?.message}
          >
            <Select 
              value={watch('recurringPattern')} 
              onValueChange={(value) => setValue('recurringPattern', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      </div>

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
              {isEdit ? 'Updating...' : 'Scheduling...'}
            </>
          ) : (
            <>
              {isEdit ? 'Update Meeting' : 'Schedule Meeting'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default MeetingForm;
