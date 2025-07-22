// src/pages/Transactions.jsx
import React, { useState, useEffect } from 'react';
import { transactionService } from '@/services/transactionService';
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
import { PageLayout, PageSection, StatsGrid, FiltersSection, ContentCard } from '@/components/layouts/PageLayout';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function Transactions() {
  const { user, groups } = useAuth();
  const isStaff = user && (user.role === 'admin' || user.role === 'officer');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id || groups[0].id);
    }
  }, [groups, selectedGroup]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      let params = {};
      if (!isStaff && groups.length > 0) {
        params.group = groups.map(g => g._id || g.id);
      } else if (isStaff && selectedGroup) {
        params.group = selectedGroup;
      }
      const data = await transactionService.getAll(params);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
      toast.error(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction._id || editingTransaction.id, formData);
        toast.success('Transaction updated successfully.');
      } else {
        await transactionService.create(formData);
        toast.success('Transaction created successfully.');
      }
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
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      ...transaction,
      amount: transaction.amount.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionService.remove(id);
      toast.success('Transaction deleted successfully.');
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const transaction = transactions.find(t => t.id === id || t._id === id);
      await transactionService.update(id, { ...transaction, status: newStatus });
      toast.success('Transaction status updated.');
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
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

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const completedAmount = filteredTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingAmount = filteredTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) return <div className="p-6">Loading transactions...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <PageLayout
      title="Transaction Management"
      action={
        <Button onClick={() => setShowForm(true)}>
          + New Transaction
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
        </StatsGrid>
      </PageSection>

      {/* Filters Section */}
      <PageSection title="Filters">
        <FiltersSection>
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
        </FiltersSection>
      </PageSection>

      {/* Transactions Table Section */}
      <PageSection title="Transactions">
        <ContentCard>
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
                <TableRow key={transaction.id || transaction._id}>
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
                  <TableCell className="text-sm text-gray-500">${Number(transaction.amount)?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Select
                      value={transaction.status}
                      onValueChange={(value) => handleStatusChange(transaction.id || transaction._id, value)}
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
                    <Button variant="link" size="sm" onClick={() => handleDelete(transaction.id || transaction._id)} className="p-0 h-auto text-red-600 hover:text-red-800">
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
              <Button type="submit" disabled={submitting}>
                {editingTransaction ? 'Update' : 'Create'} Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}