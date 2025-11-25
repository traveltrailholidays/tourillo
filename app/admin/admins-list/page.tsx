import AdminOnlyWrapper from '@/components/admin-only-layout-wrapper';
import UserList from '@/components/admin/user-list';

import { getAllAdmins } from '@/lib/actions/user-actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin List',
  description:
    'View and manage all administrators in the Tourillo admin panel. Access admin profiles, roles, and account status to efficiently oversee platform management.',
};

export default async function AdminsPage() {
  const admins = await getAllAdmins();

  return (
    <AdminOnlyWrapper>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admins Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all administrators</p>
          </div>
        </div>

        <UserList users={admins} userType="admin" />
      </div>
    </AdminOnlyWrapper>
  );
}
