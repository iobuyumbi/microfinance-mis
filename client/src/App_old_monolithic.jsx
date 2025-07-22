import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Import modular pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Loans from "./pages/Loans";
import Savings from "./pages/Savings";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [editingMember, setEditingMember] = React.useState(null);
  const [formData, setFormData] = React.useState({ name: '', email: '', phone: '', status: 'Active' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? { ...formData, id: editingMember.id } : m));
    } else {
      setMembers([...members, { ...formData, id: Date.now() }]);
    }
    setFormData({ name: '', email: '', phone: '', status: 'Active' });
    setShowForm(false);
    setEditingMember(null);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData(member);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Members Management</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add New Member
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(member)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMember(null);
                    setFormData({ name: '', email: '', phone: '', status: 'Active' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingMember ? 'Update' : 'Add'} Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Loans() {
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
    setFormData(loan);
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
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Loan Application
        </button>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.borrower}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${loan.amount?.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.interestRate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.term} months</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.purpose}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    loan.status === 'Active' ? 'bg-green-100 text-green-800' :
                    loan.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    loan.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {loan.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {loan.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(loan.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(loan.id)}
                        className="text-red-600 hover:text-red-900 mr-2"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleEdit(loan)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(loan.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingLoan ? 'Edit Loan' : 'New Loan Application'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Borrower Name</label>
                <input
                  type="text"
                  required
                  value={formData.borrower}
                  onChange={(e) => setFormData({...formData, borrower: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount ($)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.interestRate}
                  onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Term (months)</label>
                <input
                  type="number"
                  required
                  value={formData.term}
                  onChange={(e) => setFormData({...formData, term: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                <textarea
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLoan(null);
                    setFormData({ borrower: '', amount: '', interestRate: '', term: '', purpose: '', status: 'Pending', dueDate: '' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingLoan ? 'Update' : 'Submit'} Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Savings() {
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
  const [selectedAccount, setSelectedAccount] = React.useState(null);
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

  const getAccountTransactions = (accountId) => {
    return transactions.filter(t => t.accountId === accountId);
  };

  const getAccountByNumber = (accountId) => {
    return accounts.find(acc => acc.id === accountId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Savings Management</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAccountForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Account
          </button>
          <button 
            onClick={() => setShowTransactionForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + New Transaction
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Savings Accounts
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Transactions
            </button>
          </nav>
        </div>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Holder</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.accountHolder}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.accountNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${account.balance?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.interestRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.accountType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEditAccount(account)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => {
                const account = getAccountByNumber(transaction.accountId);
                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account ? `${account.accountHolder} (${account.accountNumber})` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={transaction.type === 'Deposit' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'Deposit' ? '+' : '-'}${transaction.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Account Form Modal */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingAccount ? 'Edit Account' : 'New Savings Account'}</h2>
            <form onSubmit={handleAccountSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={accountFormData.accountHolder}
                  onChange={(e) => setAccountFormData({...accountFormData, accountHolder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={accountFormData.accountNumber}
                  onChange={(e) => setAccountFormData({...accountFormData, accountNumber: e.target.value})}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={accountFormData.balance}
                  onChange={(e) => setAccountFormData({...accountFormData, balance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={accountFormData.interestRate}
                  onChange={(e) => setAccountFormData({...accountFormData, interestRate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <select
                  value={accountFormData.accountType}
                  onChange={(e) => setAccountFormData({...accountFormData, accountType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Regular">Regular</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={accountFormData.status}
                  onChange={(e) => setAccountFormData({...accountFormData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Open Date</label>
                <input
                  type="date"
                  required
                  value={accountFormData.openDate}
                  onChange={(e) => setAccountFormData({...accountFormData, openDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountForm(false);
                    setEditingAccount(null);
                    setAccountFormData({ accountHolder: '', accountNumber: '', balance: '', interestRate: '', accountType: 'Regular', status: 'Active', openDate: '' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingAccount ? 'Update' : 'Create'} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">New Transaction</h2>
            <form onSubmit={handleTransactionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                <select
                  required
                  value={transactionFormData.accountId}
                  onChange={(e) => setTransactionFormData({...transactionFormData, accountId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Account</option>
                  {accounts.filter(acc => acc.status === 'Active').map(account => (
                    <option key={account.id} value={account.id}>
                      {account.accountHolder} ({account.accountNumber}) - ${account.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <select
                  value={transactionFormData.type}
                  onChange={(e) => setTransactionFormData({...transactionFormData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transactionFormData.amount}
                  onChange={(e) => setTransactionFormData({...transactionFormData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={transactionFormData.description}
                  onChange={(e) => setTransactionFormData({...transactionFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={transactionFormData.date}
                  onChange={(e) => setTransactionFormData({...transactionFormData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setTransactionFormData({
                      accountId: '', type: 'Deposit', amount: '', description: '', date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Process Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Transactions() {
  const [transactions, setTransactions] = React.useState([
    { id: 1, date: '2024-07-22', type: 'Loan Payment', member: 'John Doe', amount: 500, category: 'Repayment', status: 'Completed', reference: 'TXN001' },
    { id: 2, date: '2024-07-21', type: 'Savings Deposit', member: 'Jane Smith', amount: 1000, category: 'Deposit', status: 'Completed', reference: 'TXN002' },
    { id: 3, date: '2024-07-20', type: 'Loan Disbursement', member: 'Bob Johnson', amount: 5000, category: 'Disbursement', status: 'Pending', reference: 'TXN003' },
    { id: 4, date: '2024-07-19', type: 'Fee Collection', member: 'Alice Brown', amount: 25, category: 'Fee', status: 'Completed', reference: 'TXN004' },
    { id: 5, date: '2024-07-18', type: 'Savings Withdrawal', member: 'Charlie Wilson', amount: 300, category: 'Withdrawal', status: 'Completed', reference: 'TXN005' }
  ]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState(null);
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    member: '',
    amount: '',
    category: 'Deposit',
    status: 'Pending',
    reference: '',
    description: ''
  });
  const [filterStatus, setFilterStatus] = React.useState('All');
  const [filterCategory, setFilterCategory] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');

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
        reference: formData.reference || `TXN${String(Date.now()).slice(-3)}`
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
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedAmount = filteredTransactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = filteredTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transaction Management</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
          <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
          <p className="text-2xl font-bold text-blue-600">${totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-green-600">${completedAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by member, type, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Repayment">Repayment</option>
              <option value="Disbursement">Disbursement</option>
              <option value="Fee">Fee</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('All');
                setFilterCategory('All');
              }}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.reference}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.member}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.category === 'Deposit' ? 'bg-green-100 text-green-800' :
                    transaction.category === 'Withdrawal' ? 'bg-red-100 text-red-800' :
                    transaction.category === 'Repayment' ? 'bg-blue-100 text-blue-800' :
                    transaction.category === 'Disbursement' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${transaction.amount?.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={transaction.status}
                    onChange={(e) => handleStatusChange(transaction.id, e.target.value)}
                    className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${
                      transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(transaction)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Loan Payment, Savings Deposit"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Member</label>
                <input
                  type="text"
                  required
                  value={formData.member}
                  onChange={(e) => setFormData({...formData, member: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                  <option value="Repayment">Repayment</option>
                  <option value="Disbursement">Disbursement</option>
                  <option value="Fee">Fee</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
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
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingTransaction ? 'Update' : 'Create'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Reports() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [dateRange, setDateRange] = React.useState('30');
  const [selectedReport, setSelectedReport] = React.useState(null);

  // Sample data for reports
  const overviewData = {
    totalMembers: 156,
    activeLoans: 45,
    totalSavings: 125000,
    monthlyGrowth: 12.5,
    defaultRate: 2.3,
    portfolioAtRisk: 5.8
  };

  const loanReports = [
    { id: 1, borrower: 'John Doe', amount: 5000, status: 'Active', dueDate: '2024-12-31', remainingBalance: 3500 },
    { id: 2, borrower: 'Jane Smith', amount: 3000, status: 'Overdue', dueDate: '2024-07-15', remainingBalance: 2800 },
    { id: 3, borrower: 'Bob Johnson', amount: 7500, status: 'Active', dueDate: '2025-06-30', remainingBalance: 7200 }
  ];

  const savingsReports = [
    { id: 1, accountHolder: 'Alice Brown', balance: 2500, interestEarned: 87.5, accountType: 'Regular' },
    { id: 2, accountHolder: 'Charlie Wilson', balance: 5000, interestEarned: 200, accountType: 'Premium' },
    { id: 3, accountHolder: 'Diana Davis', balance: 1200, interestEarned: 36, accountType: 'Basic' }
  ];

  const transactionReports = [
    { month: 'Jan', deposits: 15000, withdrawals: 8000, loans: 25000 },
    { month: 'Feb', deposits: 18000, withdrawals: 9500, loans: 30000 },
    { month: 'Mar', deposits: 22000, withdrawals: 11000, loans: 35000 },
    { month: 'Apr', deposits: 20000, withdrawals: 10500, loans: 28000 },
    { month: 'May', deposits: 25000, withdrawals: 12000, loans: 40000 },
    { month: 'Jun', deposits: 28000, withdrawals: 13500, loans: 45000 }
  ];

  const generateReport = (type) => {
    const reportData = {
      overview: {
        title: 'Financial Overview Report',
        data: overviewData,
        generatedAt: new Date().toLocaleString()
      },
      loans: {
        title: 'Loan Portfolio Report',
        data: loanReports,
        generatedAt: new Date().toLocaleString()
      },
      savings: {
        title: 'Savings Account Report',
        data: savingsReports,
        generatedAt: new Date().toLocaleString()
      },
      transactions: {
        title: 'Transaction Analysis Report',
        data: transactionReports,
        generatedAt: new Date().toLocaleString()
      }
    };
    setSelectedReport(reportData[type]);
  };

  const exportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={() => generateReport(activeTab)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'loans', label: 'Loan Portfolio' },
              { id: 'savings', label: 'Savings Analysis' },
              { id: 'transactions', label: 'Transaction Trends' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Members</h3>
              <p className="text-3xl font-bold text-blue-600">{overviewData.totalMembers}</p>
              <p className="text-sm text-green-600 mt-1">+{overviewData.monthlyGrowth}% this month</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Loans</h3>
              <p className="text-3xl font-bold text-green-600">{overviewData.activeLoans}</p>
              <p className="text-sm text-gray-500 mt-1">Portfolio health: Good</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Savings</h3>
              <p className="text-3xl font-bold text-purple-600">${overviewData.totalSavings.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Across all accounts</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Default Rate</span>
                  <span className={`font-semibold ${
                    overviewData.defaultRate < 5 ? 'text-green-600' : 'text-red-600'
                  }`}>{overviewData.defaultRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Portfolio at Risk</span>
                  <span className={`font-semibold ${
                    overviewData.portfolioAtRisk < 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{overviewData.portfolioAtRisk}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded">
                  View Overdue Loans
                </button>
                <button className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded">
                  Generate Monthly Report
                </button>
                <button className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 rounded">
                  Export Financial Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Loan Portfolio Analysis</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loanReports.map((loan) => {
                const progress = ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
                return (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.borrower}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${loan.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${loan.remainingBalance.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        loan.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{progress.toFixed(1)}% paid</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Savings Tab */}
      {activeTab === 'savings' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Savings Account Performance</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Holder</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Earned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {savingsReports.map((account) => {
                const interestRate = (account.interestEarned / account.balance) * 100;
                return (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.accountHolder}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${account.balance.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+${account.interestEarned}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.accountType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-semibold ${
                        interestRate > 3 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {interestRate.toFixed(1)}% yield
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Transaction Trends</h3>
            <div className="text-sm text-gray-500 mb-4">Note: Install 'recharts' package to see interactive charts</div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deposits</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Withdrawals</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loans</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Flow</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionReports.map((month) => {
                    const netFlow = month.deposits - month.withdrawals + month.loans;
                    return (
                      <tr key={month.month}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{month.month}</td>
                        <td className="px-4 py-2 text-sm text-green-600">+${month.deposits.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-red-600">-${month.withdrawals.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-blue-600">${month.loans.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          <span className={netFlow > 0 ? 'text-green-600' : 'text-red-600'}>
                            {netFlow > 0 ? '+' : ''}${netFlow.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generated Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Generated: {selectedReport.generatedAt}</p>
            </div>
            
            <div className="mb-6">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(selectedReport.data, null, 2)}
              </pre>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => exportReport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export Excel
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const [notifications, setNotifications] = React.useState([
    { id: 1, type: 'payment_due', title: 'Payment Due Reminder', message: 'John Doe has a loan payment due tomorrow ($500)', timestamp: '2024-07-22 10:30', read: false, priority: 'high' },
    { id: 2, type: 'new_member', title: 'New Member Registration', message: 'Jane Smith has registered as a new member', timestamp: '2024-07-22 09:15', read: true, priority: 'medium' },
    { id: 3, type: 'loan_approved', title: 'Loan Approved', message: 'Loan application for Bob Johnson ($7,500) has been approved', timestamp: '2024-07-21 16:45', read: false, priority: 'medium' },
    { id: 4, type: 'system', title: 'System Maintenance', message: 'Scheduled maintenance will occur tonight from 2-4 AM', timestamp: '2024-07-21 14:20', read: true, priority: 'low' },
    { id: 5, type: 'overdue', title: 'Overdue Payment Alert', message: 'Alice Brown has an overdue payment of $300', timestamp: '2024-07-21 11:00', read: false, priority: 'high' }
  ]);
  const [showForm, setShowForm] = React.useState(false);
  const [filterType, setFilterType] = React.useState('all');
  const [filterRead, setFilterRead] = React.useState('all');
  const [formData, setFormData] = React.useState({
    type: 'general',
    title: '',
    message: '',
    priority: 'medium',
    recipients: 'all'
  });
  const [activeTab, setActiveTab] = React.useState('inbox');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNotification = {
      ...formData,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      read: false
    };
    setNotifications([newNotification, ...notifications]);
    setFormData({
      type: 'general',
      title: '',
      message: '',
      priority: 'medium',
      recipients: 'all'
    });
    setShowForm(false);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAsUnread = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: false } : n));
  };

  const deleteNotification = (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.read) ||
                       (filterRead === 'unread' && !notification.read);
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_due': return '💰';
      case 'new_member': return '👤';
      case 'loan_approved': return '✅';
      case 'overdue': return '⚠️';
      case 'system': return '🔧';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} unread notifications
            {highPriorityCount > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                ({highPriorityCount} high priority)
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Mark All Read
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Notification
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'inbox', label: 'Inbox', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'high_priority', label: 'High Priority', count: highPriorityCount }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'unread') setFilterRead('unread');
                  else if (tab.id === 'high_priority') { setFilterRead('all'); setFilterType('all'); }
                  else { setFilterRead('all'); setFilterType('all'); }
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="payment_due">Payment Due</option>
              <option value="new_member">New Member</option>
              <option value="loan_approved">Loan Approved</option>
              <option value="overdue">Overdue</option>
              <option value="system">System</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterType('all');
                setFilterRead('all');
              }}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No notifications found matching your filters.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white p-4 rounded-lg shadow border-l-4 ${
                !notification.read ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${
                notification.priority === 'high' ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getPriorityColor(notification.priority)
                      }`}>
                        {notification.priority}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      !notification.read ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read ? (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Mark Read
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsUnread(notification.id)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Mark Unread
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Notification Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Notification</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="payment_due">Payment Due</option>
                  <option value="new_member">New Member</option>
                  <option value="loan_approved">Loan Approved</option>
                  <option value="overdue">Overdue</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <select
                  value={formData.recipients}
                  onChange={(e) => setFormData({...formData, recipients: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="staff">Staff Only</option>
                  <option value="members">Members Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      type: 'general',
                      title: '',
                      message: '',
                      priority: 'medium',
                      recipients: 'all'
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Settings() {
  const [activeTab, setActiveTab] = React.useState('general');
  const [settings, setSettings] = React.useState({
    general: {
      organizationName: 'Microfinance Solutions Ltd',
      currency: 'USD',
      timezone: 'UTC-5',
      language: 'English',
      dateFormat: 'MM/DD/YYYY'
    },
    loan: {
      defaultInterestRate: 12.5,
      maxLoanAmount: 50000,
      minLoanAmount: 500,
      defaultLoanTerm: 12,
      gracePeriod: 7,
      lateFee: 25
    },
    savings: {
      defaultInterestRate: 3.5,
      minBalance: 100,
      withdrawalLimit: 5000,
      maintenanceFee: 5,
      compoundingFrequency: 'Monthly'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      paymentReminders: true,
      overdueAlerts: true,
      systemUpdates: true,
      reminderDays: 3
    },
    security: {
      sessionTimeout: 30,
      passwordExpiry: 90,
      twoFactorAuth: false,
      loginAttempts: 5,
      auditLog: true
    }
  });
  const [showSaveMessage, setShowSaveMessage] = React.useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        general: {
          organizationName: 'Microfinance Solutions Ltd',
          currency: 'USD',
          timezone: 'UTC-5',
          language: 'English',
          dateFormat: 'MM/DD/YYYY'
        },
        loan: {
          defaultInterestRate: 12.5,
          maxLoanAmount: 50000,
          minLoanAmount: 500,
          defaultLoanTerm: 12,
          gracePeriod: 7,
          lateFee: 25
        },
        savings: {
          defaultInterestRate: 3.5,
          minBalance: 100,
          withdrawalLimit: 5000,
          maintenanceFee: 5,
          compoundingFrequency: 'Monthly'
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          paymentReminders: true,
          overdueAlerts: true,
          systemUpdates: true,
          reminderDays: 3
        },
        security: {
          sessionTimeout: 30,
          passwordExpiry: 90,
          twoFactorAuth: false,
          loginAttempts: 5,
          auditLog: true
        }
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>

      {showSaveMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'General', icon: '⚙️' },
              { id: 'loan', label: 'Loan Settings', icon: '💰' },
              { id: 'savings', label: 'Savings Settings', icon: '🏦' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'security', label: 'Security', icon: '🔒' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
              <input
                type="text"
                value={settings.general.organizationName}
                onChange={(e) => handleSettingChange('general', 'organizationName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.general.currency}
                onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="NGN">NGN - Nigerian Naira</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC-5">UTC-5 (Eastern Time)</option>
                <option value="UTC+0">UTC+0 (GMT)</option>
                <option value="UTC+3">UTC+3 (East Africa Time)</option>
                <option value="UTC+1">UTC+1 (West Africa Time)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={settings.general.language}
                onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Swahili">Swahili</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select
                value={settings.general.dateFormat}
                onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loan Settings */}
      {activeTab === 'loan' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Loan Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.loan.defaultInterestRate}
                onChange={(e) => handleSettingChange('loan', 'defaultInterestRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Loan Amount</label>
              <input
                type="number"
                value={settings.loan.maxLoanAmount}
                onChange={(e) => handleSettingChange('loan', 'maxLoanAmount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Loan Amount</label>
              <input
                type="number"
                value={settings.loan.minLoanAmount}
                onChange={(e) => handleSettingChange('loan', 'minLoanAmount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Loan Term (months)</label>
              <input
                type="number"
                value={settings.loan.defaultLoanTerm}
                onChange={(e) => handleSettingChange('loan', 'defaultLoanTerm', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period (days)</label>
              <input
                type="number"
                value={settings.loan.gracePeriod}
                onChange={(e) => handleSettingChange('loan', 'gracePeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Late Fee ($)</label>
              <input
                type="number"
                value={settings.loan.lateFee}
                onChange={(e) => handleSettingChange('loan', 'lateFee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Savings Settings */}
      {activeTab === 'savings' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Savings Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.savings.defaultInterestRate}
                onChange={(e) => handleSettingChange('savings', 'defaultInterestRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Balance ($)</label>
              <input
                type="number"
                value={settings.savings.minBalance}
                onChange={(e) => handleSettingChange('savings', 'minBalance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Withdrawal Limit ($)</label>
              <input
                type="number"
                value={settings.savings.withdrawalLimit}
                onChange={(e) => handleSettingChange('savings', 'withdrawalLimit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Maintenance Fee ($)</label>
              <input
                type="number"
                value={settings.savings.maintenanceFee}
                onChange={(e) => handleSettingChange('savings', 'maintenanceFee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Compounding</label>
              <select
                value={settings.savings.compoundingFrequency}
                onChange={(e) => handleSettingChange('savings', 'compoundingFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Payment Reminders</h3>
                <p className="text-sm text-gray-500">Send reminders for upcoming payments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.paymentReminders}
                  onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Overdue Alerts</h3>
                <p className="text-sm text-gray-500">Alert for overdue payments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.overdueAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'overdueAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Reminder Days</label>
              <input
                type="number"
                value={settings.notifications.reminderDays}
                onChange={(e) => handleSettingChange('notifications', 'reminderDays', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Days before due date to send reminder</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
              <input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Login Attempts</label>
              <input
                type="number"
                value={settings.security.loginAttempts}
                onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Require 2FA for all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Audit Logging</h3>
                <p className="text-sm text-gray-500">Log all user activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.auditLog}
                  onChange={(e) => handleSettingChange('security', 'auditLog', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
