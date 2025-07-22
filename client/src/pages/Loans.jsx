// Import necessary React hooks
import * as React from 'react';
import { loanService } from '@/services/loanService';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

// Import Shadcn UI components
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { PageLayout, PageSection, StatsGrid, FiltersSection, ContentCard } from '@/components/layouts/PageLayout';
import { toast } from 'sonner';

export default function Loans() {
  const { user, groups } = useAuth();
  const isStaff = user && (user.role === 'admin' || user.role === 'officer');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loans, setLoans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState(null);
  const [formData, setFormData] = React.useState({
    borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: ''
  });
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchLoans();
  }, []);

  React.useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, selectedGroup]);

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      let params = {};
      if (!isStaff && groups.length > 0) {
        params.group = groups.map(g => g._id || g.id);
      } else if (isStaff && selectedGroup) {
        params.group = selectedGroup;
      }
      const data = await loanService.getAll(params);
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load loans');
      toast.error(err.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingLoan) {
        await loanService.update(editingLoan._id || editingLoan.id, formData);
        toast.success('Loan updated successfully.');
      } else {
        await loanService.create(formData);
        toast.success('Loan created successfully.');
      }
      setShowForm(false);
      setEditingLoan(null);
      setFormData({ borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: '' });
      fetchLoans();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormData(loan);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;
    try {
      await loanService.remove(id);
      toast.success('Loan deleted successfully.');
      fetchLoans();
    } catch (err) {
      toast.error(err.message || 'Failed to delete loan.');
    }
  };

  const handleApprove = async (id) => {
    try {
      const loan = loans.find(l => l.id === id || l._id === id);
      await loanService.update(id, { ...loan, status: 'Approved' });
      toast.success('Loan approved.');
      fetchLoans();
    } catch (err) {
      toast.error(err.message || 'Failed to approve loan.');
    }
  };

  const handleReject = async (id) => {
    try {
      const loan = loans.find(l => l.id === id || l._id === id);
      await loanService.update(id, { ...loan, status: 'Rejected' });
      toast.success('Loan rejected.');
      fetchLoans();
    } catch (err) {
      toast.error(err.message || 'Failed to reject loan.');
    }
  };

  // Calculate loan statistics
  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.status === 'Active').length;
  const pendingLoans = loans.filter(l => l.status === 'Pending').length;
  const totalAmount = loans.reduce((sum, l) => sum + Number(l.amount || 0), 0);

  if (loading) return <div className="p-6">Loading loans...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <PageLayout
      title="Loans Management"
      action={
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingLoan(null);
            setFormData({ borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: '' });
          }}
        >
          + New Loan Application
        </Button>
      }
      headerContent={
        isStaff && (
          <div className="w-64">
            <Label htmlFor="group">Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup} id="group">
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
        )
      }
    >
      {/* Statistics Section */}
      <PageSection title="Overview">
        <StatsGrid cols={4}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{totalLoans}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{activeLoans}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{pendingLoans}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">${totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </StatsGrid>
      </PageSection>

      {/* Loans Table Section */}
      <PageSection title="Loan Applications">
        <ContentCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Borrower</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id || loan._id}>
                <TableCell className="font-medium">{loan.borrower}</TableCell>
                <TableCell>${loan.amount?.toLocaleString()}</TableCell>
                <TableCell>{loan.interestRate}%</TableCell>
                <TableCell>{loan.term} months</TableCell>
                <TableCell>{loan.purpose}</TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    loan.status === 'Active' ? 'bg-green-100 text-green-800' :
                    loan.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    loan.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {loan.status}
                  </span>
                </TableCell>
                <TableCell>
                  {loan.status === 'Pending' && (
                    <>
                      <Button variant="link" onClick={() => handleApprove(loan.id || loan._id)} className="p-0 h-auto mr-2 text-green-600">
                        Approve
                      </Button>
                      <Button variant="link" onClick={() => handleReject(loan.id || loan._id)} className="p-0 h-auto mr-2 text-red-600">
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="link" onClick={() => handleEdit(loan)} className="p-0 h-auto mr-2">
                    Edit
                  </Button>
                  <Button variant="link" onClick={() => handleDelete(loan.id || loan._id)} className="p-0 h-auto text-red-600">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </ContentCard>
      </PageSection>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingLoan ? 'Edit Loan' : 'New Loan Application'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="borrower" className="text-right">
                Borrower Name
              </Label>
              <Input
                id="borrower"
                type="text"
                required
                value={formData.borrower}
                onChange={(e) => setFormData({...formData, borrower: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Loan Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interestRate" className="text-right">
                Interest Rate (%)
              </Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                required
                value={formData.interestRate}
                onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">
                Term (months)
              </Label>
              <Input
                id="term"
                type="number"
                required
                value={formData.term}
                onChange={(e) => setFormData({...formData, term: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purpose" className="text-right">
                Purpose
              </Label>
              <Textarea
                id="purpose"
                required
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingLoan(null);
                  setFormData({ borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {editingLoan ? 'Update' : 'Submit'} Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}