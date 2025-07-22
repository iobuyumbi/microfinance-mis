import React, { useState, useEffect } from 'react';
import { groupService } from '@/services/groupService';
import { Button, Card, CardHeader, CardTitle, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label } from '../components/ui';
import { toast } from 'sonner';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', meetingFrequency: 'monthly' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await groupService.getAll();
      setGroups(data.data || data || []);
    } catch (err) {
      setError(err.message || 'Failed to load groups');
      toast.error(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingGroup) {
        await groupService.update(editingGroup._id || editingGroup.id, formData);
        toast.success('Group updated successfully.');
      } else {
        await groupService.create(formData);
        toast.success('Group created successfully.');
      }
      setShowForm(false);
      setEditingGroup(null);
      setFormData({ name: '', location: '', meetingFrequency: 'monthly' });
      fetchGroups();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({ name: group.name, location: group.location, meetingFrequency: group.meetingFrequency });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await groupService.remove(id);
      toast.success('Group deleted successfully.');
      fetchGroups();
    } catch (err) {
      toast.error(err.message || 'Failed to delete group.');
    }
  };

  if (loading) return <div className="p-6">Loading groups...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Groups Management</h1>
        <Button onClick={() => { setShowForm(true); setEditingGroup(null); setFormData({ name: '', location: '', meetingFrequency: 'monthly' }); }}>
          + New Group
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Meeting Frequency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group._id || group.id}>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>{group.location}</TableCell>
                  <TableCell>{group.meetingFrequency}</TableCell>
                  <TableCell>
                    <Button variant="link" onClick={() => handleEdit(group)} className="p-0 h-auto mr-2">Edit</Button>
                    <Button variant="link" onClick={() => handleDelete(group._id || group.id)} className="p-0 h-auto text-red-600">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit Group' : 'New Group'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Group Name</Label>
              <Input id="name" type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input id="location" type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meetingFrequency" className="text-right">Meeting Frequency</Label>
              <Input id="meetingFrequency" type="text" value={formData.meetingFrequency} onChange={e => setFormData({ ...formData, meetingFrequency: e.target.value })} className="col-span-3" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingGroup(null); setFormData({ name: '', location: '', meetingFrequency: 'monthly' }); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{editingGroup ? 'Update' : 'Create'} Group</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 