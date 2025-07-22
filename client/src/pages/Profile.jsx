import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../components/ui';
import { toast } from 'sonner';
import UserAvatar from '@/components/custom/UserAvatar';
import { Mail, Phone, User as UserIcon } from 'lucide-react';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await userService.update(user._id || user.id, formData);
      toast.success('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="p-6">Loading profile...</div>;
  if (!user) return <div className="p-6 text-red-500">User not found.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg pb-8">
          <UserAvatar user={user} size="xl" showBadge showStatus className="mb-2 shadow-lg" />
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <UserIcon className="w-6 h-6 mr-1 text-white/80" />
            {user.name}
          </CardTitle>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1 text-white/90"><Mail className="w-4 h-4" /> {user.email}</span>
            <span className="flex items-center gap-1 text-white/90"><Phone className="w-4 h-4" /> {user.phone || 'N/A'}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" value={formData.name} disabled={!editing} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} disabled={!editing} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="text" value={formData.phone} disabled={!editing} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex space-x-3 mt-4">
              {editing ? (
                <>
                  <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                  <Button variant="outline" onClick={() => { setEditing(false); setFormData({ name: user.name, email: user.email, phone: user.phone }); }}>Cancel</Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
