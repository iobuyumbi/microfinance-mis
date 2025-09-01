import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Search, Edit2, Trash2, DollarSign, Calendar, User, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoanForm from '../components/forms/LoanForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { loanService } from '../services/loanService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loanService.getAllLoans();
      setLoans(response.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to fetch loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async (loanData) => {
    try {
      const response = await loanService.createLoan(loanData);
      setLoans(prev => [...prev, response.data]);
      setIsDialogOpen(false);
      toast.success('Loan created successfully');
    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error(error.response?.data?.message || 'Failed to create loan');
    }
  };

  const handleUpdateLoan = async (id, loanData) => {
    try {
      const response = await loanService.updateLoan(id, loanData);
      setLoans(prev => prev.map(loan => 
        loan._id === id ? response.data : loan
      ));
      setEditingLoan(null);
      setIsDialogOpen(false);
      toast.success('Loan updated successfully');
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error(error.response?.data?.message || 'Failed to update loan');
    }
  };

  const handleDeleteLoan = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await loanService.deleteLoan(id);
      setLoans(prev => prev.filter(loan => loan._id !== id));
      toast.success('Loan deleted successfully');
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error(error.response?.data?.message || 'Failed to delete loan');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [`${id}_status`]: true }));
      const response = await loanService.updateLoanStatus(id, newStatus);
      setLoans(prev => prev.map(loan => 
        loan._id === id ? { ...loan, status: newStatus } : loan
      ));
      toast.success(`Loan ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating loan status:', error);
      toast.error(error.response?.data?.message || 'Failed to update loan status');
    } finally {
      setActionLoading(prev => ({ ...prev, [`${id}_status`]: false }));
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.borrower?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.group?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
      defaulted: 'bg-red-200 text-red-900'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      approved: <CheckCircle className="h-4 w-4" />,
      active: <DollarSign className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
      defaulted: <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const calculateProgress = (loan) => {
    if (!loan.repaymentSchedule || loan.repaymentSchedule.length === 0) return 0;
    const paidInstallments = loan.repaymentSchedule.filter(schedule => schedule.status === 'paid').length;
    return (paidInstallments / loan.repaymentSchedule.length) * 100;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loans Management</h1>
          <p className="text-muted-foreground">Manage loan applications and repayments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLoan(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLoan ? 'Edit Loan' : 'Create New Loan'}
              </DialogTitle>
            </DialogHeader>
            <LoanForm
              loan={editingLoan}
              onSubmit={editingLoan ? 
                (data) => handleUpdateLoan(editingLoan._id, data) : 
                handleCreateLoan
              }
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by borrower, group, or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="defaulted">Defaulted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLoans.map((loan) => (
          <Card key={loan._id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    ${loan.amount?.toLocaleString() || '0'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {loan.loanId || 'No ID'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(loan.status)}>
                    {getStatusIcon(loan.status)}
                    <span className="ml-1">{loan.status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">{loan.borrower?.name || 'Unknown Borrower'}</span>
                </div>

                {loan.group && (
                  <div className="text-sm text-muted-foreground">
                    Group: {loan.group.name}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Interest:</span>
                    <div className="font-medium">{loan.interestRate || 0}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Term:</span>
                    <div className="font-medium">{loan.term || 0} months</div>
                  </div>
                </div>

                {loan.status === 'active' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>{Math.round(calculateProgress(loan))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(calculateProgress(loan))}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingLoan(loan);
                        setIsDialogOpen(true);
                      }}
                      disabled={actionLoading[loan._id]}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    {loan.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusChange(loan._id, 'approved')}
                          disabled={actionLoading[`${loan._id}_status`]}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusChange(loan._id, 'rejected')}
                          disabled={actionLoading[`${loan._id}_status`]}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {loan.status === 'approved' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStatusChange(loan._id, 'active')}
                        disabled={actionLoading[`${loan._id}_status`]}
                      >
                        Disburse
                      </Button>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={actionLoading[loan._id]}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Loan</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this loan? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteLoan(loan._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLoans.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No loans found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first loan application'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Loan
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}