// Import necessary React hooks
import React, { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';

// Import Shadcn UI components
import { Button, Card, CardHeader, CardTitle, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { PageLayout, PageSection, StatsGrid, ContentCard } from '@/components/layouts/PageLayout';
import { toast } from 'sonner';

// Assuming AuthContext is correctly set up in your project
// You might need to adjust the path based on your project structure
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth(); // Uncomment if you have AuthContext setup

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
      toast.error(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <PageLayout title="Dashboard">
      <PageSection title="Overview">
        <StatsGrid cols={4}>
          <ContentCard>
            <CardHeader>
              <CardTitle>Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalMembers ?? '-'}</p>
            </CardContent>
          </ContentCard>
          <ContentCard>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats?.activeLoans ?? '-'}</p>
            </CardContent>
          </ContentCard>
          <ContentCard>
            <CardHeader>
              <CardTitle>Total Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">${stats?.totalSavings?.toLocaleString() ?? '-'}</p>
            </CardContent>
          </ContentCard>
          <ContentCard>
            <CardHeader>
              <CardTitle>Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{stats?.monthlyGrowth ?? '-'}%</p>
            </CardContent>
          </ContentCard>
        </StatsGrid>
      </PageSection>
    </PageLayout>
  );
}