// src/pages/Transactions.jsx
import React, { useState } from 'react';

// Shadcn UI Imports
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Textarea
} from '../components/ui';


export default function Transactions() {
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2024-07-22', type: 'Loan Payment', member: 'John Doe', amount: 500, category: 'Repayment', status: 'Completed', reference: 'TXN001', description: 'Monthly loan payment' },
    { id: 2, date: '2024-07-21', type: 'Savings Deposit', member: 'Jane Smith', amount: 1000, category: 'Deposit', status: 'Completed', reference: 'TXN002', description: 'Initial savings deposit' },
    { id: 3, date: '2024-07-20', type: 'Loan Disbursement', member: 'Bob Johnson', amount: 5000, category: 'Disbursement', status: 'Pending', reference: 'TXN003', description: 'New personal loan' },
    { id: 4, date: '2024-07-19', type: 'Fee Collection', member: 'Alice Brown', amount: 25, category: 'Fee', status: 'Completed', reference: 'TXN004', description: 'Late payment fee' },
    { id: 5, date: '2024-07-18', type: 'Savings Withdrawal', member: 'Charlie Wilson', amount: 300, category: 'Withdrawal', status: 'Completed', reference: 'TXN005', description: 'Emergency withdrawal' }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    member: '',
    amount: '',
    category: 'Deposit',
    status: 'Pending',
    reference: '',
    description: ''
  });
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ?
        { ...formData, id: editingTransaction.id, amount: parseFloat(formData.amount) } : t
      ));
    } else {
      const newTransaction = {
        ...formData,
        id: Date.now(),
        amount: parseFloat(formData.amount),
        reference: formData.reference || `TXN${String(Date.now()).slice(-4)}` // Changed slice to 4 for more variety
      };
      setTransactions([newTransaction, ...transactions]);
    }
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: '',
      member: '',
      amount: '',
      category: 'Deposit',
      status: 'Pending',
      reference: '',
      description: ''
    });
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      ...transaction,
      amount: transaction.amount.toString()
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filterStatus === 'All' || transaction.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || transaction.category === filterCategory;
    const matchesSearch = transaction.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedAmount = filteredTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = filteredTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
        <Button onClick={() => setShowForm(true)}>
          + New Transaction
        </Button>
      </div>

      ---

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${completedAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      ---

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search-term" className="mb-2">Search</Label>
            <Input
              id="search-term"
              type="text"
              placeholder="Search by member, type, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="filter-status" className="mb-2">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="filter-status">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-category" className="mb-2">Category</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Deposit">Deposit</SelectItem>
                <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                <SelectItem value="Repayment">Repayment</SelectItem>
                <SelectItem value="Disbursement">Disbursement</SelectItem>
                <SelectItem value="Fee">Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('All');
                setFilterCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      ---

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-sm text-gray-500">{transaction.date}</TableCell>
                  <TableCell className="font-medium">{transaction.reference}</TableCell>
                  <TableCell className="text-sm text-gray-500">{transaction.type}</TableCell>
                  <TableCell className="text-sm text-gray-500">{transaction.member}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.category === 'Deposit' ? 'bg-green-100 text-green-800' :
                      transaction.category === 'Withdrawal' ? 'bg-red-100 text-red-800' :
                      transaction.category === 'Repayment' ? 'bg-blue-100 text-blue-800' :
                      transaction.category === 'Disbursement' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">${transaction.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Select
                      value={transaction.status}
                      onValueChange={(value) => handleStatusChange(transaction.id, value)}
                    >
                      <SelectTrigger className={`h-8 text-xs font-semibold rounded-full border-0 ${
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button variant="link" size="sm" onClick={() => handleEdit(transaction)} className="p-0 h-auto mr-2">
                      Edit
                    </Button>
                    <Button variant="link" size="sm" onClick={() => handleDelete(transaction.id)} className="p-0 h-auto text-red-600 hover:text-red-800">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      ---

      {/* Transaction Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Transaction Type</Label>
                <Input
                  id="type"
                  type="text"
                  required
                  placeholder="e.g., Loan Payment, Savings Deposit"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member" className="text-right">Member</Label>
                <Input
                  id="member"
                  type="text"
                  required
                  value={formData.member}
                  onChange={(e) => setFormData({...formData, member: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger id="category" className="col-span-3">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="Repayment">Repayment</SelectItem>
                    <SelectItem value="Disbursement">Disbursement</SelectItem>
                    <SelectItem value="Fee">Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">Reference</Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-3"
                  rows="3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    type: '',
                    member: '',
                    amount: '',
                    category: 'Deposit',
                    status: 'Pending',
                    reference: '',
                    description: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTransaction ? 'Update' : 'Create'} Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}