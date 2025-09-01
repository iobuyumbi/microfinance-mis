
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Calendar,
  User,
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import SavingsForm from '../components/forms/SavingsForm';
import { savingsService } from '../services/savingsService';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatDate } from '../utils/formatters';

const SavingsPage = () => {
  const [savings, setSavings] = useState([]);
  const [savingsStats, setSavingsStats] = useState({
    totalSavings: 0,
    totalMembers: 0,
    averageBalance: 0,
    monthlyGrowth: 0,
    activeAccounts: 0,
    totalInterestEarned: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [sortBy, setSortBy] = useState('balance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isCreateSavingsOpen, setIsCreateSavingsOpen] = useState(false);
  const [isEditSavingsOpen, setIsEditSavingsOpen] = useState(false);
  const [currentSavings, setCurrentSavings] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Fetch savings data
  useEffect(() => {
    fetchSavings();
    fetchSavingsStats();
  }, []);

  // Filter and sort savings
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (filterStatus) params.status = filterStatus;
    if (filterGroup) params.group = filterGroup;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    fetchSavings(params);
  }, [searchTerm, filterStatus, filterGroup, sortBy, sortOrder]);

  const fetchSavings = async (params = {}) => {
    try {
      setLoading(true);
      const response = await savingsService.getAll(params);
      setSavings(response.data || response || []);
    } catch (error) {
      console.error('Error fetching savings:', error);
      toast.error('Failed to fetch savings data');
      setSavings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavingsStats = async () => {
    try {
      const response = await savingsService.getStats();
      setSavingsStats(response.data || response || {});
    } catch (error) {
      console.error('Error fetching savings stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchSavings(),
      fetchSavingsStats()
    ]);
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleCreateSavings = async (savingsData) => {
    try {
      await savingsService.create(savingsData);
      toast.success('Savings account created successfully');
      setIsCreateSavingsOpen(false);
      fetchSavings();
      fetchSavingsStats();
    } catch (error) {
      console.error('Error creating savings:', error);
      toast.error(error.response?.data?.message || 'Failed to create savings account');
    }
  };

  const handleEditSavings = async (savingsData) => {
    try {
      await savingsService.update(currentSavings._id, savingsData);
      toast.success('Savings account updated successfully');
      setIsEditSavingsOpen(false);
      setCurrentSavings(null);
      fetchSavings();
      fetchSavingsStats();
    } catch (error) {
      console.error('Error updating savings:', error);
      toast.error(error.response?.data?.message || 'Failed to update savings account');
    }
  };

  const handleDeleteSavings = async (savingsId) => {
    if (!window.confirm('Are you sure you want to delete this savings account?')) {
      return;
    }

    try {
      await savingsService.delete(savingsId);
      toast.success('Savings account deleted successfully');
      fetchSavings();
      fetchSavingsStats();
    } catch (error) {
      console.error('Error deleting savings:', error);
      toast.error(error.response?.data?.message || 'Failed to delete savings account');
    }
  };

  const openEditModal = (savings) => {
    setCurrentSavings(savings);
    setIsEditSavingsOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'default', color: 'bg-green-100 text-green-800' },
      inactive: { variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
      suspended: { variant: 'destructive', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    
    return (
      <Badge className={config.color}>
        {status || 'inactive'}
      </Badge>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner size="lg" text="Loading savings data..." />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Savings Management</h1>
            <p className="text-muted-foreground">
              Manage member savings accounts and track balances
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateSavingsOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Savings Account
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(savingsStats.totalSavings)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {savingsStats.totalMembers} members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(savingsStats.averageBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per savings account
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              {savingsStats.monthlyGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {savingsStats.monthlyGrowth >= 0 ? '+' : ''}
                {savingsStats.monthlyGrowth?.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                From last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {savingsStats.activeAccounts}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by member name or account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance">Balance</SelectItem>
                  <SelectItem value="member">Member Name</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="lastTransaction">Last Activity</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Savings List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Savings Accounts</CardTitle>
            <CardDescription>
              {savings.length} savings account{savings.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !refreshing ? (
              <LoadingSpinner text="Loading savings..." />
            ) : savings.length === 0 ? (
              <div className="text-center py-8">
                <PiggyBank className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No savings accounts found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus 
                    ? 'No savings accounts match your current filters.'
                    : 'Get started by creating your first savings account.'
                  }
                </p>
                <Button onClick={() => setIsCreateSavingsOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Savings Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {savings.map((account) => (
                  <Card key={account._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {account.member?.name || 'Unknown Member'}
                                </h3>
                                {getStatusBadge(account.status)}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                  <DollarSign className="mr-1 h-4 w-4" />
                                  Balance: <span className="font-medium ml-1 text-foreground">
                                    {formatCurrency(account.balance)}
                                  </span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Building2 className="mr-1 h-4 w-4" />
                                  Group: <span className="font-medium ml-1 text-foreground">
                                    {account.group?.name || 'No Group'}
                                  </span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <TrendingUp className="mr-1 h-4 w-4" />
                                  Interest: <span className="font-medium ml-1 text-foreground">
                                    {account.interestRate || 0}%
                                  </span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Calendar className="mr-1 h-4 w-4" />
                                  Created: <span className="font-medium ml-1 text-foreground">
                                    {formatDate(account.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSavings(account._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Savings Modal */}
        <Dialog open={isCreateSavingsOpen} onOpenChange={setIsCreateSavingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Savings Account</DialogTitle>
              <DialogDescription>
                Set up a new savings account for a member
              </DialogDescription>
            </DialogHeader>
            <SavingsForm
              onSubmit={handleCreateSavings}
              onCancel={() => setIsCreateSavingsOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Savings Modal */}
        <Dialog open={isEditSavingsOpen} onOpenChange={setIsEditSavingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Savings Account</DialogTitle>
              <DialogDescription>
                Update savings account information
              </DialogDescription>
            </DialogHeader>
            <SavingsForm
              initialData={currentSavings}
              onSubmit={handleEditSavings}
              onCancel={() => {
                setIsEditSavingsOpen(false);
                setCurrentSavings(null);
              }}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default SavingsPage;
