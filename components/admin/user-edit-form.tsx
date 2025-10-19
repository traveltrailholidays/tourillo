'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUser } from '@/lib/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  isAgent: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

interface UserEditFormProps {
  user: User;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ user }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    isAdmin: user.isAdmin,
    isAgent: user.isAgent,
    isActive: user.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        isAdmin: formData.isAdmin,
        isAgent: formData.isAgent,
        isActive: formData.isActive,
      });

      toast.success('User updated successfully!');
      router.refresh();
      router.back();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserType = () => {
    if (formData.isAdmin) return 'Admin';
    if (formData.isAgent) return 'Agent';
    return 'User';
  };

  return (
    <div className="bg-foreground rounded-lg shadow-lg p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user details and permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>User ID</Label>
              <input
                type="text"
                value={user.id}
                disabled
                className="w-full px-4 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-600 dark:text-gray-400"
              />
            </div>

            <div>
              <Label>User Type</Label>
              <div className="flex items-center h-[52px] px-4 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {getUserType()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions & Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            Permissions & Status
          </h2>

          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium">
                  Account Status
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.isActive ? 'User can sign in' : 'User is deactivated'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <Label htmlFor="isAgent" className="text-base font-medium">
                  Agent Access
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Grant agent permissions and features
                </p>
              </div>
              <Switch
                id="isAgent"
                checked={formData.isAgent}
                onCheckedChange={(checked) => {
                  setFormData({ 
                    ...formData, 
                    isAgent: checked,
                    isAdmin: checked ? false : formData.isAdmin // Remove admin if agent is enabled
                  })
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <Label htmlFor="isAdmin" className="text-base font-medium">
                  Admin Access
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Grant full administrative privileges
                </p>
              </div>
              <Switch
                id="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => {
                  setFormData({ 
                    ...formData, 
                    isAdmin: checked,
                    isAgent: checked ? false : formData.isAgent // Remove agent if admin is enabled
                  })
                }}
              />
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            Account Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Never'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            variant="outline"
            className="px-8 py-3 font-semibold"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserEditForm;
