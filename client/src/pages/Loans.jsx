// Import necessary React hooks
import * as React from 'react';

// Import Shadcn UI components
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';


export default function Loans() {
  const [loans, setLoans] = React.useState([
    { id: 1, borrower: 'John Doe', amount: 5000, interestRate: 10, term: 12, purpose: 'Business expansion', status: 'Active', dueDate: '2024-12-31' },
    { id: 2, borrower: 'Jane Smith', amount: 3000, interestRate: 8, term: 6, purpose: 'Equipment purchase', status: 'Pending', dueDate: '2024-08-15' },
    { id: 3, borrower: 'Bob Johnson', amount: 7500, interestRate: 12, term: 18, purpose: 'Inventory', status: 'Approved', dueDate: '2025-06-30' }
  ]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState(null);
  const [formData, setFormData] = React.useState({
    borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLoan) {
      setLoans(loans.map(l => l.id === editingLoan.id ? { ...formData, id: editingLoan.id } : l));
    } else {
      setLoans([...loans, { ...formData, id: Date.now() }]);
    }
    setFormData({ borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: '' });
    setShowForm(false);
    setEditingLoan(null);
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormData(loan); // Pre-fill the form with existing loan data
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this loan?')) {
      setLoans(loans.filter(l => l.id !== id));
    }
  };

  const handleApprove = (id) => {
    setLoans(loans.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
  };

  const handleReject = (id) => {
    setLoans(loans.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Loans Management</h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingLoan(null); // Ensure new form is clean
            setFormData({ borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: '' });
          }}
        >
          + New Loan Application
        </Button>
      </div>

      {/* Loans Table */}
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
              <TableRow key={loan.id}>
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
                      <Button variant="link" onClick={() => handleApprove(loan.id)} className="p-0 h-auto mr-2 text-green-600">
                        Approve
                      </Button>
                      <Button variant="link" onClick={() => handleReject(loan.id)} className="p-0 h-auto mr-2 text-red-600">
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="link" onClick={() => handleEdit(loan)} className="p-0 h-auto mr-2">
                    Edit
                  </Button>
                  <Button variant="link" onClick={() => handleDelete(loan.id)} className="p-0 h-auto text-red-600">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Form Modal */}
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
              <Button type="submit">
                {editingLoan ? 'Update' : 'Submit'} Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}