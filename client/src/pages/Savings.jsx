// Import necessary React hooks
import * as React from 'react';
import { savingsService } from '@/services/savingsService';

// Import Shadcn UI components
import { Button, Input, Label, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui';
import { toast } from 'sonner';


export default function Savings() {
  const [accounts, setAccounts] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showAccountForm, setShowAccountForm] = React.useState(false);
  const [showTransactionForm, setShowTransactionForm] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState(null);
  const [accountFormData, setAccountFormData] = React.useState({
    accountHolder: '', accountNumber: '', balance: '', interestRate: '', accountType: 'Regular', status: 'Active', openDate: ''
  });
  const [transactionFormData, setTransactionFormData] = React.useState({
    accountId: '', type: 'Deposit', amount: '', description: '', date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('accounts');

  React.useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await savingsService.getAll();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load accounts');
      toast.error(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAccount) {
        await savingsService.update(editingAccount._id || editingAccount.id, accountFormData);
        toast.success('Account updated successfully.');
      } else {
        await savingsService.create(accountFormData);
        toast.success('Account created successfully.');
      }
      setShowAccountForm(false);
      setEditingAccount(null);
      setAccountFormData({ accountHolder: '', accountNumber: '', balance: '', interestRate: '', accountType: 'Regular', status: 'Active', openDate: '' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setAccountFormData({
      ...account,
      balance: account.balance.toString(),
      interestRate: account.interestRate.toString()
    });
    setShowAccountForm(true);
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings account?')) return;
    try {
      await savingsService.remove(id);
      toast.success('Account deleted successfully.');
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
    }
  };

  const getAccountByNumber = (accountId) => {
    return accounts.find(acc => acc.id === accountId || acc._id === accountId);
  };

  // Transaction logic remains local for now, but can be refactored to use backend if needed

  if (loading) return <div className="p-6">Loading accounts...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Savings Management</h1>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAccountForm(true)}>
            + New Account
          </Button>
          <Button onClick={() => setShowTransactionForm(true)} variant="secondary">
            + New Transaction
          </Button>
        </div>
      </div>
      <Tabs defaultValue="accounts" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts">Savings Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="mt-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Holder</TableHead>
                  <TableHead>Account #</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id || account._id}>
                    <TableCell className="font-medium">{account.accountHolder}</TableCell>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>${account.balance?.toLocaleString()}</TableCell>
                    <TableCell>{account.interestRate}%</TableCell>
                    <TableCell>{account.accountType}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {account.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" onClick={() => handleEditAccount(account)} className="p-0 h-auto mr-2">
                        Edit
                      </Button>
                      <Button variant="link" onClick={() => handleDeleteAccount(account.id || account._id)} className="p-0 h-auto text-red-600">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="mt-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const account = getAccountByNumber(transaction.accountId);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        {account ? `${account.accountHolder} (${account.accountNumber})` : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.type === 'Deposit' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'Deposit' ? '+' : '-'}${transaction.amount?.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'New Savings Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAccountSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountHolder" className="text-right">
                Account Holder Name
              </Label>
              <Input
                id="accountHolder"
                type="text"
                required
                value={accountFormData.accountHolder}
                onChange={(e) => setAccountFormData({...accountFormData, accountHolder: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountNumber" className="text-right">
                Account Number
              </Label>
              <Input
                id="accountNumber"
                type="text"
                value={accountFormData.accountNumber}
                onChange={(e) => setAccountFormData({...accountFormData, accountNumber: e.target.value})}
                placeholder="Auto-generated if empty"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Initial Balance ($)
              </Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                required
                value={accountFormData.balance}
                onChange={(e) => setAccountFormData({...accountFormData, balance: e.target.value})}
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
                value={accountFormData.interestRate}
                onChange={(e) => setAccountFormData({...accountFormData, interestRate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountType" className="text-right">
                Account Type
              </Label>
              <Select
                value={accountFormData.accountType}
                onValueChange={(value) => setAccountFormData({...accountFormData, accountType: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={accountFormData.status}
                onValueChange={(value) => setAccountFormData({...accountFormData, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="openDate" className="text-right">
                Open Date
              </Label>
              <Input
                id="openDate"
                type="date"
                required
                value={accountFormData.openDate}
                onChange={(e) => setAccountFormData({...accountFormData, openDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAccountForm(false);
                  setEditingAccount(null);
                  setAccountFormData({ accountHolder: '', accountNumber: '', balance: '', interestRate: '', accountType: 'Regular', status: 'Active', openDate: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {editingAccount ? 'Update' : 'Create'} Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); setShowTransactionForm(false); }} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionAccount" className="text-right">
                Account
              </Label>
              <Select
                required
                value={transactionFormData.accountId.toString()}
                onValueChange={(value) => setTransactionFormData({...transactionFormData, accountId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Account</SelectItem>
                  {accounts.filter(acc => acc.status === 'Active').map(account => (
                    <SelectItem key={account.id || account._id} value={(account.id || account._id).toString()}>
                      {account.accountHolder} ({account.accountNumber}) - ${account.balance.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionType" className="text-right">
                Transaction Type
              </Label>
              <Select
                value={transactionFormData.type}
                onValueChange={(value) => setTransactionFormData({...transactionFormData, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deposit">Deposit</SelectItem>
                  <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionAmount" className="text-right">
                Amount ($)
              </Label>
              <Input
                id="transactionAmount"
                type="number"
                step="0.01"
                required
                value={transactionFormData.amount}
                onChange={(e) => setTransactionFormData({...transactionFormData, amount: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="transactionDescription"
                required
                value={transactionFormData.description}
                onChange={(e) => setTransactionFormData({...transactionFormData, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionDate" className="text-right">
                Date
              </Label>
              <Input
                id="transactionDate"
                type="date"
                required
                value={transactionFormData.date}
                onChange={(e) => setTransactionFormData({...transactionFormData, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTransactionForm(false);
                  setTransactionFormData({
                    accountId: '', type: 'Deposit', amount: '', description: '', date: new Date().toISOString().split('T')[0]
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="secondary">
                Process Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}