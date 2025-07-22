import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Label, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';

export default function MeetingForm({ initialValues = {}, onSubmit, onCancel, loading = false, groups = [] }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      date: initialValues.date || '',
      location: initialValues.location || '',
      agenda: initialValues.agenda || '',
      group: initialValues.group || (groups[0]?._id || ''),
    },
  });

  React.useEffect(() => {
    reset({
      date: initialValues.date || '',
      location: initialValues.location || '',
      agenda: initialValues.agenda || '',
      group: initialValues.group || (groups[0]?._id || ''),
    });
  }, [initialValues, groups, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {groups.length > 0 && (
        <div>
          <Label htmlFor="group">Group</Label>
          <Select defaultValue={initialValues.group || groups[0]?._id || ''} {...register('group')}>
            <SelectTrigger>
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g._id || g.id} value={g._id || g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register('date', { required: true })} />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" type="text" {...register('location', { required: true })} />
      </div>
      <div>
        <Label htmlFor="agenda">Agenda</Label>
        <Textarea id="agenda" {...register('agenda', { required: true })} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
} 