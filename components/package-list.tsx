'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Star } from 'lucide-react';
import Link from 'next/link';
import { deleteListing } from '@/lib/actions/listing-actions';
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
import toast from 'react-hot-toast';

export interface Listing {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  days: number;
  nights: number;
  rating: number;
  discount: number;
  createdAt: string;
}

interface PackageListProps {
  packages: Listing[];
}

// Helper function to format date to dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format price
const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export const PackageList: React.FC<PackageListProps> = ({ packages }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const PAGE_SIZE = 10;

  const filtered = useMemo(
    () =>
      packages.filter((p) =>
        [p.title, p.category, p.location].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, packages]
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteListing(deleteId);
      toast.success('Package deleted successfully!');
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete package');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded bg-foreground p-3 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          className="w-full px-3 py-2 rounded bg-background text-sm md:text-base"
          placeholder="Search packages..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary">Title</TableHead>
              <TableHead className="text-primary">Category</TableHead>
              <TableHead className="text-primary">Location</TableHead>
              <TableHead className="text-primary">Price</TableHead>
              <TableHead className="text-primary">Duration</TableHead>
              <TableHead className="text-primary">Rating</TableHead>
              <TableHead className="text-primary">Discount</TableHead>
              <TableHead className="text-primary">Created</TableHead>
              <TableHead className="text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No packages found.
                </TableCell>
              </TableRow>
            )}
            {pageData.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  <Link href={`/packages/${pkg.id}`} className="hover:underline capitalize font-medium">
                    {pkg.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-sm px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                    {pkg.category}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{pkg.location}</TableCell>
                <TableCell className="font-semibold text-green-600 dark:text-green-400">
                  {formatPrice(pkg.price)}
                </TableCell>
                <TableCell className="text-sm">
                  {pkg.days}D / {pkg.nights}N
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{pkg.rating.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {pkg.discount > 0 ? (
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {pkg.discount}% OFF
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{formatDate(pkg.createdAt)}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/admin/package/edit/${pkg.id}`}>
                    <Button size="icon" variant="ghost" title="Edit">
                      <Pencil className="h-4 w-4 text-purple-600" />
                    </Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(pkg.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete this package?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this package? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary" onClick={() => setDeleteId(null)}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} type="button">
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Visible on tablets and below */}
      <div className="lg:hidden space-y-3">
        {pageData.length === 0 && <div className="text-center py-8 text-sm">No packages found.</div>}
        {pageData.map((pkg) => (
          <div key={pkg.id} className="rounded-lg border p-4 space-y-3 bg-background">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link href={`/packages/${pkg.id}`} className="hover:underline">
                  <h3 className="font-semibold text-base capitalize truncate">{pkg.title}</h3>
                </Link>
                <span className="inline-block mt-1 capitalize text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                  {pkg.category}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Link href={`/admin/package/edit/${pkg.id}`}>
                  <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit">
                    <Pencil className="h-4 w-4 text-purple-600" />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDeleteId(pkg.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Delete this package?</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this package? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <DialogClose asChild>
                        <Button variant="secondary" onClick={() => setDeleteId(null)} className="w-full sm:w-auto">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        type="button"
                        className="w-full sm:w-auto"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Package details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                <span className="text-right">{pkg.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Price:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatPrice(pkg.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                <span>
                  {pkg.days}D / {pkg.nights}N
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{pkg.rating.toFixed(1)}</span>
                </div>
              </div>
              {pkg.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Discount:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">{pkg.discount}% OFF</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <span>{formatDate(pkg.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
        <span className="text-xs sm:text-sm">
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

export default PackageList;
