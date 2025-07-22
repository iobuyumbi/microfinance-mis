// Import necessary React hooks
import * as React from 'react';

// Import Shadcn UI components
import { Button, Input, Label, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui';


export default function Savings() {
  const [accounts, setAccounts] = React.useState([
    { id: 1, accountHolder: 'John Doe', accountNumber: 'SAV001', balance: 2500, interestRate: 3.5, accountType: 'Regular', status: 'Active', openDate: '2024-01-15' },
    { id: 2, accountHolder: 'Jane Smith', accountNumber: 'SAV002', balance: 5000, interestRate: 4.0, accountType: 'Premium', status: 'Active', openDate: '2024-02-20' },
    { id: 3, accountHolder: 'Bob Johnson', accountNumber: 'SAV003', balance: 1200, interestRate: 3.0, accountType: 'Basic', status: 'Inactive', openDate: '2024-03-10' }
  ]);
  const [transactions, setTransactions] = React.useState([
    { id: 1, accountId: 1, type: 'Deposit', amount: 500, date: '2024-07-20', description: 'Monthly savings' },
    { id: 2, accountId: 1, type: 'Withdrawal', amount: 200, date: '2024-07-18', description: 'Emergency withdrawal' },
    { id: 3, accountId: 2, type: 'Deposit', amount: 1000, date: '2024-07-19', description: 'Salary deposit' }
  ]);
  const [showAccountForm, setShowAccountForm] = React.useState(false);
  const [showTransactionForm, setShowTransactionForm] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState(null);
  const [accountFormData, setAccountFormData] = React.useState({
    accountHolder: '', accountNumber: '', balance: '', interestRate: '', accountType: 'Regular', status: 'Active', openDate: ''
  });
  const [transactionFormData, setTransactionFormData] = React.useState({
    accountId: '', type: 'Deposit', amount: '', description: '', date: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = React.useState('accounts');

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    if (editingAccount) {
      setAccounts(accounts.map(acc => acc.id === editingAccount.id ? { ...accountFormData, id: editingAccount.id, balance: parseFloat(accountFormData.balance), interestRate: parseFloat(accountFormData.interestRate) } : acc));
    } else {
      const newAccount = {
        ...accountFormData,
        id: Date.now(),
        balance: parseFloat(accountFormData.balance),
        interestRate: parseFloat(accountFormData.interestRate),
        accountNumber: accountFormData.accountNumber || `SAV${String(Date.now()).slice(-3)}`
      };
      setAccounts([...accounts, newAccount]);
    }
    setAccountFormData({ accountHolder: '', accountNumber: '', balance: '', interestRate: '', accountType: 'Regular', status: 'Active', openDate: '' });
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(transactionFormData.amount);
    const accountId = parseInt(transactionFormData.accountId);

    // Update account balance
    setAccounts(accounts.map(acc => {
      if (acc.id === accountId) {
        const newBalance = transactionFormData.type === 'Deposit'
          ? acc.balance + amount
          : acc.balance - amount;
        return { ...acc, balance: Math.max(0, newBalance) };
      }
      return acc;
    }));

    // Add transaction record
    const newTransaction = {
      ...transactionFormData,
      id: Date.now(),
      accountId,
      amount
    };
    setTransactions([newTransaction, ...transactions]);

    setTransactionFormData({
      accountId: '', type: 'Deposit', amount: '', description: '', date: new Date().toISOString().split('T')[0]
    });
    setShowTransactionForm(false);
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

  const handleDeleteAccount = (id) => {
    if (confirm('Are you sure you want to delete this savings account?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
      setTransactions(transactions.filter(t => t.accountId !== id));
    }
  };

  const getAccountByNumber = (accountId) => {
    return accounts.find(acc => acc.id === accountId);
  };

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
                  <TableRow key={account.id}>
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
                      <Button variant="link" onClick={() => handleDeleteAccount(account.id)} className="p-0 h-auto text-red-600">
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

      {/* Account Form Modal */}
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
              <Button type="submit">
                {editingAccount ? 'Update' : 'Create'} Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Form Modal */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransactionSubmit} className="grid gap-4 py-4">
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
                    <SelectItem key={account.id} value={account.id.toString()}>
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