
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { settingsService } from '@/services/settingsService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AlertTriangle, Save, RefreshCw } from 'lucide-react';

const SettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      organizationName: '',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      language: 'English',
      dateFormat: 'DD/MM/YYYY'
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
      meetingReminders: true,
      loanApprovalAlerts: true,
      lowBalanceAlerts: true
    },
    security: {
      requireEmailVerification: true,
      sessionTimeout: 60,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      twoFactorAuth: false
    },
    system: {
      maintenanceMode: false,
      allowRegistration: true,
      defaultUserRole: 'member',
      maxFileSize: 5,
      backupFrequency: 'daily'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings(settings);
      toast({
        title: 'Success',
        description: 'Settings updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system settings and preferences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="loan">Loan</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic organization and system configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={settings.general.organizationName}
                    onChange={(e) => updateSetting('general', 'organizationName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => updateSetting('general', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Swahili">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.general.dateFormat}
                    onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loan Settings */}
        <TabsContent value="loan">
          <Card>
            <CardHeader>
              <CardTitle>Loan Settings</CardTitle>
              <CardDescription>
                Configure default loan parameters and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultInterestRate">Default Interest Rate (%)</Label>
                  <Input
                    id="defaultInterestRate"
                    type="number"
                    step="0.1"
                    value={settings.loan.defaultInterestRate}
                    onChange={(e) => updateSetting('loan', 'defaultInterestRate', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoanAmount">Maximum Loan Amount</Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    value={settings.loan.maxLoanAmount}
                    onChange={(e) => updateSetting('loan', 'maxLoanAmount', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="minLoanAmount">Minimum Loan Amount</Label>
                  <Input
                    id="minLoanAmount"
                    type="number"
                    value={settings.loan.minLoanAmount}
                    onChange={(e) => updateSetting('loan', 'minLoanAmount', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultLoanTerm">Default Loan Term (months)</Label>
                  <Input
                    id="defaultLoanTerm"
                    type="number"
                    value={settings.loan.defaultLoanTerm}
                    onChange={(e) => updateSetting('loan', 'defaultLoanTerm', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    value={settings.loan.gracePeriod}
                    onChange={(e) => updateSetting('loan', 'gracePeriod', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="lateFee">Late Fee Amount</Label>
                  <Input
                    id="lateFee"
                    type="number"
                    value={settings.loan.lateFee}
                    onChange={(e) => updateSetting('loan', 'lateFee', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Settings */}
        <TabsContent value="savings">
          <Card>
            <CardHeader>
              <CardTitle>Savings Settings</CardTitle>
              <CardDescription>
                Configure savings account parameters and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="savingsInterestRate">Default Interest Rate (%)</Label>
                  <Input
                    id="savingsInterestRate"
                    type="number"
                    step="0.1"
                    value={settings.savings.defaultInterestRate}
                    onChange={(e) => updateSetting('savings', 'defaultInterestRate', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="minBalance">Minimum Balance</Label>
                  <Input
                    id="minBalance"
                    type="number"
                    value={settings.savings.minBalance}
                    onChange={(e) => updateSetting('savings', 'minBalance', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawalLimit">Daily Withdrawal Limit</Label>
                  <Input
                    id="withdrawalLimit"
                    type="number"
                    value={settings.savings.withdrawalLimit}
                    onChange={(e) => updateSetting('savings', 'withdrawalLimit', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maintenanceFee">Monthly Maintenance Fee</Label>
                  <Input
                    id="maintenanceFee"
                    type="number"
                    value={settings.savings.maintenanceFee}
                    onChange={(e) => updateSetting('savings', 'maintenanceFee', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="compoundingFrequency">Interest Compounding</Label>
                  <Select
                    value={settings.savings.compoundingFrequency}
                    onValueChange={(value) => updateSetting('savings', 'compoundingFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paymentReminders">Payment Reminders</Label>
                    <p className="text-sm text-gray-500">Remind members about upcoming payments</p>
                  </div>
                  <Switch
                    id="paymentReminders"
                    checked={settings.notifications.paymentReminders}
                    onCheckedChange={(checked) => updateSetting('notifications', 'paymentReminders', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="meetingReminders">Meeting Reminders</Label>
                    <p className="text-sm text-gray-500">Remind members about upcoming meetings</p>
                  </div>
                  <Switch
                    id="meetingReminders"
                    checked={settings.notifications.meetingReminders}
                    onCheckedChange={(checked) => updateSetting('notifications', 'meetingReminders', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="loanApprovalAlerts">Loan Approval Alerts</Label>
                    <p className="text-sm text-gray-500">Notify when loans are approved or rejected</p>
                  </div>
                  <Switch
                    id="loanApprovalAlerts"
                    checked={settings.notifications.loanApprovalAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications', 'loanApprovalAlerts', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowBalanceAlerts">Low Balance Alerts</Label>
                    <p className="text-sm text-gray-500">Alert when account balance is low</p>
                  </div>
                  <Switch
                    id="lowBalanceAlerts"
                    checked={settings.notifications.lowBalanceAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications', 'lowBalanceAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                    <p className="text-sm text-gray-500">Users must verify email before accessing system</p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Enable 2FA for enhanced security</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and maintenance options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                      System will be unavailable to users
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('system', 'maintenanceMode', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistration">Allow User Registration</Label>
                    <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={settings.system.allowRegistration}
                    onCheckedChange={(checked) => updateSetting('system', 'allowRegistration', checked)}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultUserRole">Default User Role</Label>
                    <Select
                      value={settings.system.defaultUserRole}
                      onValueChange={(value) => updateSetting('system', 'defaultUserRole', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="officer">Officer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={settings.system.maxFileSize}
                      onChange={(e) => updateSetting('system', 'maxFileSize', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={settings.system.backupFrequency}
                      onValueChange={(value) => updateSetting('system', 'backupFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
