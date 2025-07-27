// src/pages/Accounts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { accountService } from '@/services/accountService';
import { useAuth } from '@/context/AuthContext'; // Import useAuth if needed for role-based access

// Shadcn UI Components
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select, // Import Select components
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog, // Import AlertDialog for delete confirmation
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter, // Correctly imported AlertDialogFooter
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge, // Import Badge for status display
} from '@/components/ui'; // Correct path for Shadcn UI components
import { PageLayout, PageSection, StatsGrid, ContentCard } from '@/components/layouts/PageLayout';
import { toast } from 'sonner';

// Import Lucide React Icons
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  CreditCard, // For account
  User, // For account holder
  Hash, // For account number
  Tag, // For account type
  Activity, // For status
  Loader2, // For loading spinners
  Banknote, // For total balance
  CheckCircle, // For active accounts
  Users, // For overall members
} from 'lucide-react';

// Custom Components (assuming StatsCard is available)
import { StatsCard } from '@/components/custom/StatsCard'; // Assuming StatsCard is available

export default function Accounts() {
  const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth(); // Using useAuth for access control
  const isStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'officer');

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for accounts data
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({ accountHolder: '', accountNumber: '', balance: '', accountType: 'savings', status: 'Active' });
  const [submitting, setSubmitting] = useState(false); // For form submission loading state
  const [deletingAccountId, setDeletingAccountId] = useState(null); // State for delete account confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for delete account dialog

  // Memoize fetchAccounts to prevent unnecessary re-renders and re-fetches
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await accountService.getAll();
      setAccounts(Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []));
    } catch (err) {
      const errorMessage = err.message || 'Failed to load accounts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies as it fetches all accounts

  // Initial fetch on component mount and when auth status changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchAccounts();
      } else {
        setLoading(false);
        setError('You must be logged in to view accounts.');
      }
    }
  }, [isAuthenticated, authLoading, fetchAccounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Ensure balance is a number before sending
      const payload = {
        ...formData,
        balance: parseFloat(formData.balance),
      };

      if (editingAccount) {
        await accountService.update(editingAccount._id || editingAccount.id, payload);
        toast.success('Account updated successfully.');
      } else {
        await accountService.create(payload);
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
      balance: account.balance.toString(), // Convert to string for input value
      accountType: account.accountType,
      status: account.status
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingAccountId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false); // Close dialog first
    if (!deletingAccountId) return;
    try {
      await accountService.remove(deletingAccountId);
      toast.success('Account deleted successfully.');
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
    } finally {
      setDeletingAccountId(null);
    }
  };

  // Calculate account statistics
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.status === 'Active').length;
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const avgBalance = accounts.length > 0 ? totalBalance / accounts.length : 0;

  // Render loading and access denied states
  if (authLoading) {
    return (
      <PageLayout title="Accounts Management">
        <div className="p-6 text-center text-muted-foreground">Checking authentication and permissions...</div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout title="Accounts Management">
        <div className="p-6 text-center text-red-500">
          <CreditCard className="h-10 w-10 mx-auto mb-4 text-red-400" />
          Access Denied: Please log in to view accounts.
        </div>
      </PageLayout>
    );
  }

  // Once authenticated, proceed with data loading or error display for accounts
  if (loading && accounts.length === 0) {
    return (
      <PageLayout title="Accounts Management">
        <div className="p-6 text-center text-muted-foreground">Loading accounts...</div>
      </PageLayout>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <PageLayout title="Accounts Management">
        <div className="p-6 text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Accounts Management"
      action={
        <Button onClick={() => { setShowForm(true); setEditingAccount(null); setFormData({ accountHolder: '', accountNumber: '', balance: '', accountType: 'savings', status: 'Active' }); }} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      }
    >
      {/* Statistics Section */}
      <PageSection title="Overview">
        <StatsGrid cols={4}>
          <StatsCard
            title="Total Accounts"
            value={totalAccounts}
            description="All registered accounts"
            icon={CreditCard}
            trend={{ value: 5, isPositive: true }} // Example trend
          />
          <StatsCard
            title="Active Accounts"
            value={activeAccounts}
            description="Currently active accounts"
            icon={CheckCircle}
            className="border-green-200 bg-green-50/50"
            trend={{ value: 3, isPositive: true }} // Example trend
          />
          <StatsCard
            title="Total Balance"
            value={`$${totalBalance.toLocaleString()}`}
            description="Sum across all accounts"
            icon={Banknote}
            className="border-blue-200 bg-blue-50/50"
            trend={{ value: 25000, isPositive: true, isCurrency: true }} // Example trend
          />
          <StatsCard
            title="Average Balance"
            value={`$${avgBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            description="Average balance per account"
            icon={DollarSign}
            className="border-purple-200 bg-purple-50/50"
            trend={{ value: 1000, isPositive: true, isCurrency: true }} // Example trend
          />
        </StatsGrid>
      </PageSection>

      {/* Accounts Table Section */}
      <PageSection title="All Accounts">
        <ContentCard isLoading={loading}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center"><User className="h-4 w-4 mr-2" /> Account Holder</TableHead>
                <TableHead className="flex items-center"><Hash className="h-4 w-4 mr-2" /> Account #</TableHead>
                <TableHead className="flex items-center"><DollarSign className="h-4 w-4 mr-2" /> Balance</TableHead>
                <TableHead className="flex items-center"><Tag className="h-4 w-4 mr-2" /> Type</TableHead>
                <TableHead className="flex items-center"><Activity className="h-4 w-4 mr-2" /> Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton rows for loading state
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded w-3/4"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-1/2"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-1/3"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-1/4"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-1/4"></div></TableCell>
                    <TableCell className="text-right"><div className="h-4 bg-muted rounded w-1/2 ml-auto"></div></TableCell>
                  </TableRow>
                ))
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account._id || account.id}>
                    <TableCell className="font-medium">{account.accountHolder}</TableCell>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>${account.balance?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {account.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${
                        account.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(account)} className="p-0 h-auto mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteClick(account._id || account.id)} // Set ID on trigger click
                            disabled={deletingAccountId === (account.id || account._id)}
                          >
                            {deletingAccountId === (account.id || account._id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the account for
                              <span className="font-semibold"> {account.accountHolder} ({account.accountNumber})</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => confirmDelete()}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter> {/* Corrected closing tag */}
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ContentCard>
      </PageSection>

      {/* New/Edit Account Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'New Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountHolder" className="text-right flex items-center"><User className="h-4 w-4 mr-1" /> Account Holder</Label>
              <Input
                id="accountHolder"
                type="text"
                required
                value={formData.accountHolder}
                onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountNumber" className="text-right flex items-center"><Hash className="h-4 w-4 mr-1" /> Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Auto-generated if empty"
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right flex items-center"><DollarSign className="h-4 w-4 mr-1" /> Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                required
                value={formData.balance}
                onChange={e => setFormData({ ...formData, balance: e.target.value })}
                className="col-span-3"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountType" className="text-right flex items-center"><Tag className="h-4 w-4 mr-1" /> Account Type</Label>
              <Select
                value={formData.accountType}
                onValueChange={value => setFormData({ ...formData, accountType: value })}
                disabled={submitting}
              >
                <SelectTrigger id="accountType" className="col-span-3">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="checking">Checking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right flex items-center"><Activity className="h-4 w-4 mr-1" /> Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => setFormData({ ...formData, status: value })}
                disabled={submitting || !isStaff} // Only staff can change status in form
              >
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditingAccount(null); setFormData({ accountHolder: '', accountNumber: '', balance: '', accountType: 'savings', status: 'Active' }); }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingAccount ? 'Update' : 'Create'} Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete Account */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
