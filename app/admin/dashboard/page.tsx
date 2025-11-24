import Dashboard from '@/components/admin/dashboard';
import { getDashboardStats } from '@/lib/actions/dashboard-actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Monitor key business metrics and insights in real time. The Tourillo admin dashboard provides an overview of bookings, revenue, user activity, and operational performance to help you manage your platform efficiently.',
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return <Dashboard initialStats={stats} />;
}
