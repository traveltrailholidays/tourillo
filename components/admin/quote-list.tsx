'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Mail, MailOpen } from 'lucide-react';
import { deleteQuote, markQuoteAsRead, markQuoteAsUnread } from '@/lib/actions/quote-actions';
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

export interface Quote {
  id: string;
  destination: string;
  date: string;
  days: number;
  name: string;
  email: string;
  phone: string;
  isRead: boolean;
  createdAt: string;
}

interface QuoteListProps {
  quotes: Quote[];
}

// Helper function to format date to dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const QuoteList: React.FC<QuoteListProps> = ({ quotes }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const PAGE_SIZE = 10;

  const filtered = useMemo(
    () =>
      quotes.filter((q) =>
        [q.name, q.email, q.phone, q.destination].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, quotes]
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteQuote(deleteId);
      toast.success('Quote deleted successfully!');
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete quote');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRead = async (quote: Quote) => {
    try {
      if (quote.isRead) {
        await markQuoteAsUnread(quote.id);
        toast.success('Marked as unread');
      } else {
        await markQuoteAsRead(quote.id);
        toast.success('Marked as read');
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleViewQuote = async (quote: Quote) => {
    setViewQuote(quote);
    if (!quote.isRead) {
      await markQuoteAsRead(quote.id);
      router.refresh();
    }
  };

  return (
    <div className="rounded bg-foreground p-3 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          className="w-full px-3 py-2 rounded bg-background text-sm md:text-base"
          placeholder="Search quotes..."
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
              <TableHead className="text-primary">Status</TableHead>
              <TableHead className="text-primary">Name</TableHead>
              <TableHead className="text-primary">Email</TableHead>
              <TableHead className="text-primary">Destination</TableHead>
              <TableHead className="text-primary">Days</TableHead>
              <TableHead className="text-primary">Date</TableHead>
              <TableHead className="text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No quote requests found.
                </TableCell>
              </TableRow>
            )}
            {pageData.map((quote) => (
              <TableRow key={quote.id} className={!quote.isRead ? 'bg-purple-50 dark:bg-purple-900/10' : ''}>
                <TableCell>
                  {quote.isRead ? (
                    <MailOpen className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Mail className="h-5 w-5 text-purple-600" />
                  )}
                </TableCell>
                <TableCell className={!quote.isRead ? 'font-semibold' : ''}>{quote.name}</TableCell>
                <TableCell>{quote.email}</TableCell>
                <TableCell>{quote.destination}</TableCell>
                <TableCell>{quote.days}</TableCell>
                <TableCell>{formatDate(quote.createdAt)}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleViewQuote(quote)}
                    title="View"
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToggleRead(quote)}
                    title={quote.isRead ? 'Mark as unread' : 'Mark as read'}
                    className="cursor-pointer"
                  >
                    {quote.isRead ? (
                      <Mail className="h-4 w-4 text-gray-600" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-purple-600" />
                    )}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(quote.id)}
                        title="Delete"
                        className="cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete this quote request?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this quote request? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary" onClick={() => setDeleteId(null)} className="cursor-pointer">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          type="button"
                          className="cursor-pointer"
                        >
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
        {pageData.length === 0 && <div className="text-center py-8 text-sm">No quote requests found.</div>}
        {pageData.map((quote) => (
          <div
            key={quote.id}
            className={`rounded-sm border p-4 space-y-3 ${
              !quote.isRead
                ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
                : 'bg-background'
            }`}
          >
            {/* Header with status and actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {quote.isRead ? (
                  <MailOpen className="h-4 w-4 text-gray-400 shrink-0" />
                ) : (
                  <Mail className="h-4 w-4 text-purple-600 shrink-0" />
                )}
                <span className={`text-base truncate ${!quote.isRead ? 'font-semibold' : ''}`}>{quote.name}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => handleViewQuote(quote)}
                  title="View"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => handleToggleRead(quote)}
                  title={quote.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  {quote.isRead ? (
                    <Mail className="h-4 w-4 text-gray-600" />
                  ) : (
                    <MailOpen className="h-4 w-4 text-purple-600" />
                  )}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => setDeleteId(quote.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Delete this quote request?</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this quote request? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <DialogClose asChild>
                        <Button
                          variant="secondary"
                          onClick={() => setDeleteId(null)}
                          className="w-full sm:w-auto cursor-pointer"
                        >
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

            {/* Quote details */}
            <div className="space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="break-all">{quote.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <span>{quote.phone}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Destination:</span>
                <span className="text-right sm:max-w-[60%] wrap-break-word">{quote.destination}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Travel Date:</span>
                <span>{quote.date}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                <span>{quote.days} days</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Request Date:</span>
                <span>{formatDate(quote.createdAt)}</span>
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

      {/* View Quote Dialog */}
      {viewQuote && (
        <Dialog open={!!viewQuote} onOpenChange={() => setViewQuote(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Quote Request Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-base wrap-break-word">{viewQuote.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-base break-all">{viewQuote.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-base">{viewQuote.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Destination</label>
                  <p className="text-base wrap-break-word">{viewQuote.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Travel Date</label>
                  <p className="text-base">{viewQuote.date}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Number of Days</label>
                  <p className="text-base">{viewQuote.days} days</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Request Date</label>
                <p className="text-base">{formatDate(viewQuote.createdAt)}</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" className="w-full sm:w-auto cursor-pointer">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default QuoteList;
