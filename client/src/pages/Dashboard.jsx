// Import necessary React hooks
import React, { useState } from 'react';

// Import Shadcn UI components
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';


// Assuming AuthContext is correctly set up in your project
// You might need to adjust the path based on your project structure
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth(); // Uncomment if you have AuthContext setup

  const [recentActivity] = useState([
    { id: 1, type: 'loan_payment', user: 'John Doe', amount: 500, description: 'Monthly loan payment received', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'new_member', user: 'Jane Smith', amount: null, description: 'New member registration completed', time: '4 hours ago', status: 'completed' },
    { id: 3, type: 'savings_deposit', user: 'Bob Johnson', amount: 1000, description: 'Savings account deposit', time: '6 hours ago', status: 'completed' },
    { id: 4, type: 'loan_application', user: 'Alice Brown', amount: 7500, description: 'New loan application submitted', time: '1 day ago', status: 'pending' },
    { id: 5, type: 'withdrawal', user: 'Charlie Wilson', amount: 300, description: 'Savings withdrawal processed', time: '1 day ago', status: 'completed' }
  ]);

  const [upcomingPayments] = useState([
    { id: 1, borrower: 'John Doe', amount: 500, dueDate: '2024-07-23', status: 'due_tomorrow' },
    { id: 2, borrower: 'Mary Johnson', amount: 750, dueDate: '2024-07-25', status: 'due_soon' },
    { id: 3, borrower: 'David Smith', amount: 400, dueDate: '2024-07-20', status: 'overdue' }
  ]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'loan_payment': return '💰';
      case 'new_member': return '👤';
      case 'savings_deposit': return '🏦';
      case 'loan_application': return '📋';
      case 'withdrawal': return '💸';
      default: return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'due_tomorrow': return 'text-orange-600 bg-orange-100';
      case 'due_soon': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Last updated</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <span className="text-blue-600 text-xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground text-green-600 flex items-center mt-1">
                <span className="mr-1">↗</span> +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Loans
              </CardTitle>
              <span className="text-green-600 text-xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">567</div>
              <p className="text-xs text-muted-foreground text-green-600 flex items-center mt-1">
                <span className="mr-1">↗</span> +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Savings
              </CardTitle>
              <span className="text-purple-600 text-xl">🏦</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$2.4M</div>
              <p className="text-xs text-muted-foreground text-green-600 flex items-center mt-1">
                <span className="mr-1">↗</span> +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Transactions
              </CardTitle>
              <span className="text-orange-600 text-xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">89</div>
              <p className="text-xs text-muted-foreground text-red-600 flex items-center mt-1">
                <span className="mr-1">↘</span> -3% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="link" className="p-0 h-auto">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.user}
                        </p>
                        <div className="flex items-center space-x-2">
                          {activity.amount && (
                            <span className="text-sm font-semibold text-gray-900">
                              ${activity.amount.toLocaleString()}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.borrower}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>{payment.dueDate}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex flex-col items-center p-4 text-center h-auto">
                    <span className="text-2xl mb-2">👤</span>
                    <span className="text-xs font-medium text-gray-700">Add Member</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 text-center h-auto">
                    <span className="text-2xl mb-2">💰</span>
                    <span className="text-xs font-medium text-gray-700">New Loan</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 text-center h-auto">
                    <span className="text-2xl mb-2">🏦</span>
                    <span className="text-xs font-medium text-gray-700">Savings Account</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 text-center h-auto">
                    <span className="text-2xl mb-2">📊</span>
                    <span className="text-xs font-medium text-gray-700">Generate Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}