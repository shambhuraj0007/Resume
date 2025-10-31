'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import CreditBalance from '@/components/credits/CreditBalance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Award, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Lazy load heavy components
const AnalysisHistory = lazy(() => import('@/components/credits/AnalysisHistory'));
const PaymentHistory = lazy(() => import('@/components/credits/PaymentHistory'));
const UpgradeModal = lazy(() => import('@/components/credits/UpgradeModal'));

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [totalAnalyses, setTotalAnalyses] = useState<number | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/signin');
  }

  const handleUpgradeSuccess = () => {
    // Refresh the page to update credit balance
    window.location.reload();
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch('/api/user/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setTotalAnalyses(data.totalAnalyses ?? 0);
        setMemberSince(data.memberSince ?? null);
      } catch (e) {
        setTotalAnalyses(0);
        setMemberSince(null);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your credits and view your analysis history
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CreditBalance onUpgradeClick={() => setUpgradeModalOpen(true)} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Total Analyses
            </CardTitle>
            <CardDescription>
              Lifetime resume analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statsLoading ? (
                <span className="inline-flex items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></span>
              ) : (
                totalAnalyses ?? 0
              )}
            </p>
            <p className="text-sm text-muted-foreground">All-time successful analyses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Member Since
            </CardTitle>
            <CardDescription>
              Account created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statsLoading ? (
                <span className="inline-flex items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></span>
              ) : memberSince ? (
                format(new Date(memberSince), 'MMM dd, yyyy')
              ) : (
                'Not available'
              )}
            </p>
            <p className="text-sm text-muted-foreground">Welcome aboard!</p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis History */}
      <div className="mb-8">
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        }>
          <AnalysisHistory />
        </Suspense>
      </div>

      {/* Payment History */}
      <div className="mb-8">
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        }>
          <PaymentHistory />
        </Suspense>
      </div>

      {/* Upgrade Modal */}
      <Suspense fallback={null}>
        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          onSuccess={handleUpgradeSuccess}
        />
      </Suspense>
    </div>
  );
}
