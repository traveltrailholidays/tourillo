import AdminOnlyWrapper from '@/components/admin-only-layout-wrapper';
import UserList from '@/components/admin/user-list';

import { getAllAgentsWithAccounts } from '@/lib/actions/user-actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agents List',
  description: 'View and manage all agents in the Tourillo admin panel. Access agent profiles and account status.',
};

export default async function AgentsPage() {
  const agents = await getAllAgentsWithAccounts(); // ✅ Updated function

  return (
    <AdminOnlyWrapper>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agents Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all agents with complete authentication details
            </p>
          </div>
        </div>

        <UserList users={agents} userType="agent" />
      </div>
    </AdminOnlyWrapper>
  );
}
