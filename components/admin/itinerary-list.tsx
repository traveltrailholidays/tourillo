'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Copy } from 'lucide-react';
import { deleteItinerary } from '@/lib/actions/itinerary-actions';
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
import Link from 'next/link';

export interface Itinerary {
  id: string;
  travelId: string;
  clientName: string;
  packageTitle: string;
  numberOfDays: number;
  numberOfNights: number;
  quotePrice: number;
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
  return `${day}/${month}/${year}`;
};

// Format price
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ItineraryList: React.FC<ItineraryListProps> = ({ itineraries }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const PAGE_SIZE = 10;

  const filtered = useMemo(
    () =>
      itineraries.filter((i) =>
        [i.travelId, i.clientName, i.packageTitle].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, itineraries]
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteItinerary(deleteId);
      toast.success('Itinerary deleted successfully!');
      setDeleteId(null);
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

  return (
    <div className="rounded bg-foreground p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          className="w-full md:max-w-xs px-3 py-2 rounded bg-background"
          placeholder="Search by Travel ID, client name, or package..."
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
              <TableHead className="text-primary">Travel ID</TableHead>
              <TableHead className="text-primary">Client Name</TableHead>
              <TableHead className="text-primary">Package Title</TableHead>
              <TableHead className="text-primary">Duration</TableHead>
              <TableHead className="text-primary">Price</TableHead>
              <TableHead className="text-primary">Created</TableHead>
              <TableHead className="text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No itineraries found.
                </TableCell>
              </TableRow>
            )}
            {pageData.map((itinerary) => (
              <TableRow key={itinerary.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600">{itinerary.travelId}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyTravelId(itinerary.travelId)}
                      title="Copy Travel ID"
                      className="h-6 w-6"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{itinerary.clientName}</TableCell>
                <TableCell className="max-w-xs truncate">{itinerary.packageTitle}</TableCell>
                <TableCell>
                  {itinerary.numberOfNights}N / {itinerary.numberOfDays}D
                </TableCell>
                <TableCell className="font-semibold">{formatPrice(itinerary.quotePrice)}</TableCell>
                <TableCell>{formatDate(itinerary.createdAt)}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/itinerary/view/${itinerary.travelId}`} target="_blank">
                    <Button size="icon" variant="ghost" title="View">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(itinerary.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete this itinerary?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this itinerary? This action cannot be undone.
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

export default ItineraryList;
