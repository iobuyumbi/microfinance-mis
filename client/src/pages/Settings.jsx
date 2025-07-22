// src/components/Settings.jsx
import React, { useState } from 'react';

// Shadcn UI Imports
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Switch,
} from '../components/ui';
 // For toggles

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
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
      systemUpdates: true, // Added for completeness, though not in original UI
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
  const [showSaveMessage, setShowSaveMessage] = useState(false);

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {showSaveMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          {[
            { id: 'general', label: 'General', icon: '⚙️' },
            { id: 'loan', label: 'Loan Settings', icon: '💰' },
            { id: 'savings', label: 'Savings Settings', icon: '🏦' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' },
            { id: 'security', label: 'Security', icon: '🔒' }
          ].map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="organizationName" className="mb-2">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  value={settings.general.organizationName}
                  onChange={(e) => handleSettingChange('general', 'organizationName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="currency" className="mb-2">Currency</Label>
                <Select
                  value={settings.general.currency}
                  onValueChange={(value) => handleSettingChange('general', 'currency', value)}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone" className="mb-2">Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) => handleSettingChange('general', 'timezone', value)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                    <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                    <SelectItem value="UTC+3">UTC+3 (East Africa Time)</SelectItem>
                    <SelectItem value="UTC+1">UTC+1 (West Africa Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language" className="mb-2">Language</Label>
                <Select
                  value={settings.general.language}
                  onValueChange={(value) => handleSettingChange('general', 'language', value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Swahili">Swahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat" className="mb-2">Date Format</Label>
                <Select
                  value={settings.general.dateFormat}
                  onValueChange={(value) => handleSettingChange('general', 'dateFormat', value)}
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="defaultInterestRate" className="mb-2">Default Interest Rate (%)</Label>
                <Input
                  id="defaultInterestRate"
                  type="number"
                  step="0.1"
                  value={settings.loan.defaultInterestRate}
                  onChange={(e) => handleSettingChange('loan', 'defaultInterestRate', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="maxLoanAmount" className="mb-2">Maximum Loan Amount</Label>
                <Input
                  id="maxLoanAmount"
                  type="number"
                  value={settings.loan.maxLoanAmount}
                  onChange={(e) => handleSettingChange('loan', 'maxLoanAmount', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="minLoanAmount" className="mb-2">Minimum Loan Amount</Label>
                <Input
                  id="minLoanAmount"
                  type="number"
                  value={settings.loan.minLoanAmount}
                  onChange={(e) => handleSettingChange('loan', 'minLoanAmount', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="defaultLoanTerm" className="mb-2">Default Loan Term (months)</Label>
                <Input
                  id="defaultLoanTerm"
                  type="number"
                  value={settings.loan.defaultLoanTerm}
                  onChange={(e) => handleSettingChange('loan', 'defaultLoanTerm', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="gracePeriod" className="mb-2">Grace Period (days)</Label>
                <Input
                  id="gracePeriod"
                  type="number"
                  value={settings.loan.gracePeriod}
                  onChange={(e) => handleSettingChange('loan', 'gracePeriod', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="lateFee" className="mb-2">Late Fee ($)</Label>
                <Input
                  id="lateFee"
                  type="number"
                  value={settings.loan.lateFee}
                  onChange={(e) => handleSettingChange('loan', 'lateFee', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Savings Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="savingsDefaultInterestRate" className="mb-2">Default Interest Rate (%)</Label>
                <Input
                  id="savingsDefaultInterestRate"
                  type="number"
                  step="0.1"
                  value={settings.savings.defaultInterestRate}
                  onChange={(e) => handleSettingChange('savings', 'defaultInterestRate', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="minBalance" className="mb-2">Minimum Balance ($)</Label>
                <Input
                  id="minBalance"
                  type="number"
                  value={settings.savings.minBalance}
                  onChange={(e) => handleSettingChange('savings', 'minBalance', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="withdrawalLimit" className="mb-2">Daily Withdrawal Limit ($)</Label>
                <Input
                  id="withdrawalLimit"
                  type="number"
                  value={settings.savings.withdrawalLimit}
                  onChange={(e) => handleSettingChange('savings', 'withdrawalLimit', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="maintenanceFee" className="mb-2">Monthly Maintenance Fee ($)</Label>
                <Input
                  id="maintenanceFee"
                  type="number"
                  value={settings.savings.maintenanceFee}
                  onChange={(e) => handleSettingChange('savings', 'maintenanceFee', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="compoundingFrequency" className="mb-2">Interest Compounding</Label>
                <Select
                  value={settings.savings.compoundingFrequency}
                  onValueChange={(value) => handleSettingChange('savings', 'compoundingFrequency', value)}
                >
                  <SelectTrigger id="compoundingFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Payment Reminders</h3>
                  <p className="text-sm text-gray-500">Send reminders for upcoming payments</p>
                </div>
                <Switch
                  checked={settings.notifications.paymentReminders}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'paymentReminders', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Overdue Alerts</h3>
                  <p className="text-sm text-gray-500">Alert for overdue payments</p>
                </div>
                <Switch
                  checked={settings.notifications.overdueAlerts}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'overdueAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">System Updates</h3>
                  <p className="text-sm text-gray-500">Receive notifications about system updates</p>
                </div>
                <Switch
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'systemUpdates', checked)}
                />
              </div>
              <div>
                <Label htmlFor="reminderDays" className="mb-2">Payment Reminder Days</Label>
                <Input
                  id="reminderDays"
                  type="number"
                  value={settings.notifications.reminderDays}
                  onChange={(e) => handleSettingChange('notifications', 'reminderDays', parseInt(e.target.value))}
                  className="w-32"
                />
                <p className="text-sm text-gray-500 mt-1">Days before due date to send reminder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="sessionTimeout" className="mb-2">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div>
                <Label htmlFor="passwordExpiry" className="mb-2">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={settings.security.passwordExpiry}
                  onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div>
                <Label htmlFor="loginAttempts" className="mb-2">Maximum Login Attempts</Label>
                <Input
                  id="loginAttempts"
                  type="number"
                  value={settings.security.loginAttempts}
                  onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Require 2FA for all users</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('security', 'twoFactorAuth', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Audit Logging</h3>
                  <p className="text-sm text-gray-500">Log all user activities</p>
                </div>
                <Switch
                  checked={settings.security.auditLog}
                  onCheckedChange={(checked) => handleSettingChange('security', 'auditLog', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}