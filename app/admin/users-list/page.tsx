import { getAllUsers } from '@/lib/actions/user-actions';
import UserList from '@/components/admin/user-list';

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all regular users</p>
      </div>

      <UserList users={users} userType="user" />
    </div>
  );
}
