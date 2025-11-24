import Dashboard from '@/components/admin/dashboard';
import { getDashboardStats } from '@/lib/actions/dashboard-actions';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return <Dashboard initialStats={stats} />;
}
