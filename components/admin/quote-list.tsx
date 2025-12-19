'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Trash2,
  Mail,
  MailOpen,
  Search,
  X,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
} from 'lucide-react';
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

type SortField = 'name' | 'email' | 'destination' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;
type StatusFilter = 'ALL' | 'READ' | 'UNREAD';

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
  const [isMounted, setIsMounted] = useState(false);

  // Filter & Sort states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const readCount = quotes.filter((q) => q.isRead).length;
    const unreadCount = quotes.filter((q) => !q.isRead).length;

    return {
      total: quotes.length,
      read: readCount,
      unread: unreadCount,
    };
  }, [quotes]);

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  // Filter and Sort Logic
  const filtered = useMemo(() => {
    let result = quotes;

    // Status Filter
    if (statusFilter === 'READ') {
      result = result.filter((q) => q.isRead);
    } else if (statusFilter === 'UNREAD') {
      result = result.filter((q) => !q.isRead);
    }

    // Search Filter
    if (search.trim()) {
      result = result.filter((q) =>
        [q.name, q.email, q.phone, q.destination].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sorting
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sortField === 'createdAt') {
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
        } else {
          aVal = a[sortField].toLowerCase();
          bVal = b[sortField].toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [search, quotes, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 ml-1 text-purple-600" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 ml-1 text-purple-600" />;
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSortField(null);
    setSortDirection(null);
    setPage(1);
  };

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

  const hasActiveFilters = statusFilter !== 'ALL' || search.trim();

  return (
    <div className="rounded bg-foreground shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded border-2 border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 transition cursor-text"
              placeholder="Search by name, email, phone, or destination..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center justify-start">
            <Button
              size="sm"
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${statusFilter === 'ALL' ? 'bg-sky-500 hover:bg-sky-600' : ''}`}
            >
              All Quotes <span className="ml-1 text-xs opacity-80">({stats.total})</span>
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'UNREAD' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('UNREAD');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${statusFilter === 'UNREAD' ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
            >
              Unread <span className="ml-1 text-xs opacity-80">({stats.unread})</span>
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'READ' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('READ');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${statusFilter === 'READ' ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              Read <span className="ml-1 text-xs opacity-80">({stats.read})</span>
            </Button>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-start">
              <Button
                size="sm"
                variant="outline"
                onClick={clearAllFilters}
                className="cursor-pointer rounded text-red-600 hover:text-red-700 hover:border-red-600 h-9"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="px-4 py-3 bg-linear-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Requests</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Unread</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Read</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.read}</p>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span>
              Showing {filtered.length} of {stats.total} quotes
            </span>
            {statusFilter !== 'ALL' && (
              <span
                className={`px-2 py-1 rounded ${
                  statusFilter === 'READ'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                }`}
              >
                {statusFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700 scrollbar-visible">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-20">Status</TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Name
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Email
                  <SortIcon field="email" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px]">Phone</TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('destination')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Destination
                  <SortIcon field="destination" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px]">Days</TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Date
                  <SortIcon field="createdAt" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 text-right min-w-[140px] sticky right-0 bg-gray-50 dark:bg-gray-800 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {search || statusFilter !== 'ALL'
                        ? 'No quotes found matching your filters'
                        : 'No quote requests found'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {pageData.map((quote) => (
              <TableRow
                key={quote.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
                  !quote.isRead ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''
                }`}
              >
                <TableCell>
                  {quote.isRead ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <MailOpen className="h-4 w-4" />
                      <span className="text-xs">Read</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-purple-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-xs font-semibold">New</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className={!quote.isRead ? 'font-semibold' : ''}>{quote.name}</TableCell>
                <TableCell className="text-sm">{quote.email}</TableCell>
                <TableCell className="text-sm font-mono">{quote.phone}</TableCell>
                <TableCell className="text-sm">{quote.destination}</TableCell>
                <TableCell className="text-sm">{quote.days} days</TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(quote.createdAt)}
                </TableCell>
                <TableCell className="sticky right-0 bg-white dark:bg-gray-900 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewQuote(quote)}
                      title="View Details"
                      className="h-8 w-8 p-0 cursor-pointer rounded"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleRead(quote)}
                      title={quote.isRead ? 'Mark as unread' : 'Mark as read'}
                      className="h-8 w-8 p-0 cursor-pointer rounded"
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
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(quote.id)}
                          title="Delete"
                          className="h-8 w-8 p-0 cursor-pointer rounded"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded">
                        <DialogHeader>
                          <DialogTitle>Delete this quote request?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete the quote request from <strong>{quote.name}</strong>? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteId(null)}
                              className="cursor-pointer rounded"
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            type="button"
                            className="cursor-pointer rounded"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
          Page {totalPages > 0 ? page : 0} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            disabled={page === 1}
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            variant="outline"
            className="cursor-pointer rounded"
          >
            Previous
          </Button>
          <Button
            disabled={page === totalPages || totalPages === 0}
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            variant="outline"
            className="cursor-pointer rounded"
          >
            Next
          </Button>
        </div>
      </div>

      {/* View Quote Dialog */}
      {viewQuote && (
        <Dialog open={!!viewQuote} onOpenChange={() => setViewQuote(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Quote Request Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-base font-medium wrap-break-word">{viewQuote.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-base break-all">{viewQuote.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-base font-mono">{viewQuote.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Status</label>
                  {viewQuote.isRead ? (
                    <div className="flex items-center gap-1 text-green-600 mt-1">
                      <MailOpen className="h-4 w-4" />
                      <span className="text-sm font-medium">Read</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-purple-600 mt-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-semibold">Unread</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Destination</label>
                  <p className="text-base wrap-break-word">{viewQuote.destination}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Travel Date</label>
                  <p className="text-base">{viewQuote.date}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Number of Days</label>
                  <p className="text-base">{viewQuote.days} days</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Request Date</label>
                  <p className="text-base">{formatDate(viewQuote.createdAt)}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleToggleRead(viewQuote)} className="cursor-pointer rounded">
                {viewQuote.isRead ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Mark as Unread
                  </>
                ) : (
                  <>
                    <MailOpen className="h-4 w-4 mr-2" />
                    Mark as Read
                  </>
                )}
              </Button>
              <DialogClose asChild>
                <Button variant="secondary" className="cursor-pointer rounded">
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
