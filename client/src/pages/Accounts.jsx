import React, { useState, useEffect } from 'react';
import { accountService } from '@/services/accountService';
import { Button, Card, CardHeader, CardTitle, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label } from '../components/ui';
import { toast } from 'sonner';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({ accountHolder: '', accountNumber: '', balance: '', accountType: 'savings', status: 'Active' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await accountService.getAll();
      setAccounts(data.data || data || []);
    } catch (err) {
      setError(err.message || 'Failed to load accounts');
      toast.error(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAccount) {
        await accountService.update(editingAccount._id || editingAccount.id, formData);
        toast.success('Account updated successfully.');
      } else {
        await accountService.create(formData);
        toast.success('Account created successfully.');
      }
      setShowForm(false);
      setEditingAccount(null);
      setFormData({ accountHolder: '', accountNumber: '', balance: '', accountType: 'savings', status: 'Active' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      accountHolder: account.accountHolder,
      accountNumber: account.accountNumber,
      balance: account.balance,
      accountType: account.accountType,
      status: account.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await accountService.remove(id);
      toast.success('Account deleted successfully.');
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
    }
  };

  if (loading) return <div className="p-6">Loading accounts...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Accounts Management</h1>
        <Button onClick={() => { setShowForm(true); setEditingAccount(null); setFormData({ accountHolder: '', accountNumber: '', balance: '', accountType: 'savings', status: 'Active' }); }}>
          + New Account
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Holder</TableHead>
                <TableHead>Account #</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account._id || account.id}>
                  <TableCell>{account.accountHolder}</TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>${account.balance?.toLocaleString()}</TableCell>
                  <TableCell>{account.accountType}</TableCell>
                  <TableCell>{account.status}</TableCell>
                  <TableCell>
                    <Button variant="link" onClick={() => handleEdit(account)} className="p-0 h-auto mr-2">Edit</Button>
                    <Button variant="link" onClick={() => handleDelete(account._id || account.id)} className="p-0 h-auto text-red-600">Delete</Button>
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
            <DialogTitle>{editingAccount ? 'Edit Account' : 'New Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountHolder" className="text-right">Account Holder</Label>
              <Input id="accountHolder" type="text" required value={formData.accountHolder} onChange={e => setFormData({ ...formData, accountHolder: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountNumber" className="text-right">Account Number</Label>
              <Input id="accountNumber" type="text" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">Balance</Label>
              <Input id="balance" type="number" required value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountType" className="text-right">Type</Label>
              <Input id="accountType" type="text" value={formData.accountType} onChange={e => setFormData({ ...formData, accountType: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Input id="status" type="text" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="col-span-3" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingAccount(null); setFormData({ accountHolder: '', accountNumber: '', balance: '', accountType: 'savings', status: 'Active' }); }}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{editingAccount ? 'Update' : 'Create'} Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 