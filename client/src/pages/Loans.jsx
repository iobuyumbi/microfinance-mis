// Import necessary React hooks
import * as React from 'react';
import { loanService } from '@/services/loanService';

// Import Shadcn UI components
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { toast } from 'sonner';

export default function Loans() {
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

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loanService.getAll();
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

  if (loading) return <div className="p-6">Loading loans...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Loans Management</h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingLoan(null);
            setFormData({ borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: '' });
          }}
        >
          + New Loan Application
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
      </div>
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
    </div>
  );
}