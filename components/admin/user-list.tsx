'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { deactivateUser, deleteUserPermanently, reactivateUser } from '@/lib/actions/user-actions';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import toast from 'react-hot-toast';
import Image from 'next/image';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UserListProps {
  users: User[];
  userType: 'user' | 'agent' | 'admin';
}

// Helper function to format date to dd/mm/yyyy
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const UserList: React.FC<UserListProps> = ({ users, userType }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [permanentDelete, setPermanentDelete] = useState(false);
  const PAGE_SIZE = 10;

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        [u.name, u.email].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, users]
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      if (permanentDelete) {
        await deleteUserPermanently(deleteId);
        toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} deleted permanently!`);
      } else {
        await deactivateUser(deleteId);
        toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} deactivated successfully!`);
      }
      setDeleteId(null);
      setPermanentDelete(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateUser(id);
      toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} reactivated successfully!`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate user');
    }
  };

  return (
    <div className="rounded bg-foreground p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          className="w-full md:max-w-xs px-3 py-2 rounded bg-background"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary">User</TableHead>
              <TableHead className="text-primary">Email</TableHead>
              <TableHead className="text-primary">Status</TableHead>
              <TableHead className="text-primary">Last Login</TableHead>
              <TableHead className="text-primary">Joined</TableHead>
              <TableHead className="text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No {userType}s found.
                </TableCell>
              </TableRow>
            )}
            {pageData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="font-medium">{user.name || 'Unnamed User'}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{formatDate(user.lastLoginAt)}</TableCell>
                <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/admin/${userType}s-list/edit/${user.id}`}>
                    <Button size="icon" variant="ghost" title="Edit">
                      <Pencil className="h-4 w-4 text-purple-600" />
                    </Button>
                  </Link>
                  
                  {!user.isActive ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleReactivate(user.id)}
                      title="Reactivate"
                    >
                      <UserCheck className="h-4 w-4 text-green-600" />
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(user.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete this {userType}?</DialogTitle>
                          <DialogDescription>
                            Choose how you want to remove this {userType}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="permanent"
                              checked={permanentDelete}
                              onCheckedChange={(checked) => setPermanentDelete(checked as boolean)}
                            />
                            <label
                              htmlFor="permanent"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Delete permanently (cannot be undone)
                            </label>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-6">
                            {permanentDelete
                              ? 'This will permanently delete the user and all their data.'
                              : 'This will deactivate the user account. They will be logged out and unable to sign in.'}
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setDeleteId(null);
                                setPermanentDelete(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            type="button"
                          >
                            {isDeleting
                              ? 'Processing...'
                              : permanentDelete
                                ? 'Delete Permanently'
                                : 'Deactivate'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">
          Page {page} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <Button disabled={page === 1} size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            Prev
          </Button>
          <Button
            disabled={page === totalPages || totalPages === 0}
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserList;
