'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Copy, Search, Calendar, User, Package as PackageIcon, Edit } from 'lucide-react';
import { deleteItinerary } from '@/lib/actions/itinerary-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export interface Itinerary {
  id: string;
  travelId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  packageTitle: string;
  numberOfDays: number;
  numberOfNights: number;
  quotePrice: number;
  pricePerPerson: number;
  createdAt: string;
}

interface ItineraryListProps {
  itineraries: Itinerary[];
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Format price
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const ItineraryList: React.FC<ItineraryListProps> = ({ itineraries }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuthStore();
  const PAGE_SIZE = 10;

  // Check if component is mounted to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if user is admin (similar to sidebar logic)
  const isAdmin = useMemo(() => {
    if (!isMounted) return false;
    return user?.isAdmin || false;
  }, [user, isMounted]);

  const filtered = useMemo(
    () =>
      itineraries.filter((i) =>
        [i.travelId, i.clientName, i.clientPhone, i.packageTitle].some((v) =>
          v?.toLowerCase().includes(search.toLowerCase())
        )
      ),
    [search, itineraries]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId || !isAdmin) {
      toast.error('Only administrators can delete itineraries');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteItinerary(deleteId);
      toast.success('Itinerary deleted successfully!');
      setDeleteId(null);
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete itinerary');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyTravelId = (travelId: string) => {
    navigator.clipboard.writeText(travelId);
    toast.success('Travel ID copied to clipboard!');
  };

  const openDeleteDialog = (id: string) => {
    if (!isMounted) return;

    if (!isAdmin) {
      toast.error('Only administrators can delete itineraries');
      return;
    }
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  return (
    <div className="rounded-sm bg-foreground shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Search and Stats */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border-2 border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Search by Travel ID, client name, phone, or package..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Itineraries</p>
              <p className="text-xl font-bold text-purple-600">{itineraries.length}</p>
            </div>
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-sm">
              <p className="text-xs text-gray-600 dark:text-gray-400">Filtered</p>
              <p className="text-xl font-bold text-blue-600">{filtered.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="text-primary font-bold">Travel ID</TableHead>
              <TableHead className="text-primary font-bold">Client Details</TableHead>
              <TableHead className="text-primary font-bold">Package</TableHead>
              <TableHead className="text-primary font-bold">Duration</TableHead>
              <TableHead className="text-primary font-bold">Pricing</TableHead>
              <TableHead className="text-primary font-bold">Created</TableHead>
              <TableHead className="text-primary font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <PackageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {search ? 'No itineraries found matching your search' : 'No itineraries found'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {pageData.map((itinerary) => (
              <TableRow key={itinerary.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {itinerary.travelId}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyTravelId(itinerary.travelId)}
                      title="Copy Travel ID"
                      className="h-7 w-7 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {itinerary.clientName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{itinerary.clientPhone}</p>
                    {itinerary.clientEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {itinerary.clientEmail}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="font-medium truncate" title={itinerary.packageTitle}>
                    {itinerary.packageTitle}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-semibold">
                      {itinerary.numberOfNights}N / {itinerary.numberOfDays}D
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-bold text-green-600 dark:text-green-400">{formatPrice(itinerary.quotePrice)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPrice(itinerary.pricePerPerson)}/person
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(itinerary.createdAt)}</p>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/itinerary/edit-itinerary/${itinerary.travelId}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Edit Itinerary"
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>
                    <Link href={`/itinerary/view/${itinerary.travelId}`} target="_blank">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Open Itinerary"
                        className="hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer"
                      >
                        <Eye className="h-4 w-4 text-green-600" />
                      </Button>
                    </Link>
                    {/* Only show delete button if mounted and user is admin */}
                    {isMounted && isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(itinerary.id)}
                        title="Delete (Admin Only)"
                        className="hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Showing {pageData.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to{' '}
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
        </span>
        <div className="flex gap-2">
          <Button disabled={page === 1} size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} variant="outline">
            Previous
          </Button>
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm font-medium">
              Page {page} of {totalPages || 1}
            </span>
          </div>
          <Button
            disabled={page === totalPages || totalPages === 0}
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Itinerary?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this itinerary? This action cannot be undone and all associated data will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting && (
                <span className="mr-2">
                  <LoadingSpinner />
                </span>
              )}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItineraryList;
