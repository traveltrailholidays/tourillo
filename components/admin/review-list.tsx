// components/admin/review-list.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Trash2,
  Star,
  Search,
  X,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Circle,
  Edit,
  EyeOff,
  Mail,
  User,
  Calendar,
  FileText,
} from 'lucide-react';
import { deleteReview, toggleReviewDisplay, toggleReviewRead } from '@/lib/actions/review-actions';
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
import Image from 'next/image';

export interface Review {
  id: string;
  name: string;
  review: string;
  rating: number;
  image: string;
  reviewDate: string;
  isDisplay: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewListProps {
  reviews: Review[];
}

type SortField = 'name' | 'rating' | 'reviewDate' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;
type StatusFilter = 'ALL' | 'READ' | 'UNREAD';
type DisplayFilter = 'ALL' | 'DISPLAYED' | 'HIDDEN';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewReview, setViewReview] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [displayFilter, setDisplayFilter] = useState<DisplayFilter>('ALL');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAdmin = useMemo(() => {
    if (!isMounted || !session?.user) return false;
    return session.user.isAdmin || false;
  }, [session, isMounted]);

  const stats = useMemo(() => {
    const readCount = reviews.filter((r) => r.isRead).length;
    const unreadCount = reviews.filter((r) => !r.isRead).length;
    const displayedCount = reviews.filter((r) => r.isDisplay).length;
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0;

    return {
      total: reviews.length,
      read: readCount,
      unread: unreadCount,
      displayed: displayedCount,
      hidden: reviews.length - displayedCount,
      avgRating: avgRating.toFixed(1),
    };
  }, [reviews]);

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

  const filtered = useMemo(() => {
    let result = reviews;

    if (statusFilter === 'READ') {
      result = result.filter((r) => r.isRead);
    } else if (statusFilter === 'UNREAD') {
      result = result.filter((r) => !r.isRead);
    }

    if (displayFilter === 'DISPLAYED') {
      result = result.filter((r) => r.isDisplay);
    } else if (displayFilter === 'HIDDEN') {
      result = result.filter((r) => !r.isDisplay);
    }

    if (search.trim()) {
      result = result.filter((r) => [r.name, r.review].some((v) => v.toLowerCase().includes(search.toLowerCase())));
    }

    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sortField === 'createdAt' || sortField === 'reviewDate') {
          aVal = new Date(sortField === 'createdAt' ? a.createdAt : a.reviewDate).getTime();
          bVal = new Date(sortField === 'createdAt' ? b.createdAt : b.reviewDate).getTime();
        } else if (sortField === 'rating') {
          aVal = a.rating;
          bVal = b.rating;
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
  }, [search, reviews, statusFilter, displayFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    setDisplayFilter('ALL');
    setSortField(null);
    setSortDirection(null);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId || !isAdmin) {
      toast.error('Only administrators can delete reviews');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReview(deleteId);
      toast.success('Review deleted successfully!');
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRead = async (review: Review) => {
    try {
      await toggleReviewRead(review.id);
      toast.success(review.isRead ? 'Marked as unread' : 'Marked as read');
      setViewReview(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleToggleDisplay = async (reviewId: string) => {
    try {
      await toggleReviewDisplay(reviewId);
      toast.success('Display status updated');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update display status');
    }
  };

  const handleViewReview = async (review: Review) => {
    setViewReview(review);
    if (!review.isRead) {
      await toggleReviewRead(review.id);
      router.refresh();
    }
  };

  const handleEdit = (reviewId: string) => {
    router.push(`/admin/review/edit/${reviewId}`);
  };

  const hasActiveFilters = statusFilter !== 'ALL' || displayFilter !== 'ALL' || search.trim();

  return (
    <div className="rounded bg-foreground shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded border-2 border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 transition cursor-text"
              placeholder="Search by name or review..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>

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
              All Reviews <span className="ml-1 text-xs opacity-80">({stats.total})</span>
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

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <Button
              size="sm"
              variant={displayFilter === 'DISPLAYED' ? 'default' : 'outline'}
              onClick={() => {
                setDisplayFilter('DISPLAYED');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${displayFilter === 'DISPLAYED' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            >
              Displayed <span className="ml-1 text-xs opacity-80">({stats.displayed})</span>
            </Button>
            <Button
              size="sm"
              variant={displayFilter === 'HIDDEN' ? 'default' : 'outline'}
              onClick={() => {
                setDisplayFilter('HIDDEN');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${displayFilter === 'HIDDEN' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
            >
              Hidden <span className="ml-1 text-xs opacity-80">({stats.hidden})</span>
            </Button>
          </div>

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="px-4 py-3 bg-linear-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Reviews</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Displayed</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.displayed}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Unread</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Avg Rating</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}</p>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span>
              Showing {filtered.length} of {stats.total} reviews
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
            {displayFilter !== 'ALL' && (
              <span
                className={`px-2 py-1 rounded ${
                  displayFilter === 'DISPLAYED'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                }`}
              >
                {displayFilter}
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
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 w-16 min-w-[60px]">S.No</TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Name
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-[300px]">Review</TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Rating
                  <SortIcon field="rating" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('reviewDate')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Review Date
                  <SortIcon field="reviewDate" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Created At
                  <SortIcon field="createdAt" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 text-right min-w-[180px] sticky right-0 bg-gray-50 dark:bg-gray-800 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {search || statusFilter !== 'ALL' || displayFilter !== 'ALL'
                        ? 'No reviews found matching your filters'
                        : 'No reviews found'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {pageData.map((review, index) => (
              <TableRow
                key={review.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${
                  !review.isRead ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''
                }`}
              >
                <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.image}
                      alt={review.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-10 h-10"
                      unoptimized
                    />
                    <span className={!review.isRead ? 'font-semibold capitalize' : ' capitalize'}>{review.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm max-w-xs">
                  <p className="line-clamp-2 capitalize truncate">{review.review}</p>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(review.reviewDate)}
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(review.createdAt)}
                </TableCell>
                <TableCell className="sticky right-0 bg-white dark:bg-gray-900 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewReview(review)}
                      title="View Full Review"
                      className="h-8 w-8 p-0 cursor-pointer rounded"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleDisplay(review.id)}
                      title={review.isDisplay ? 'Hide from website' : 'Show on website'}
                      className="h-8 w-8 p-0 cursor-pointer rounded"
                    >
                      {review.isDisplay ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>

                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(review.id)}
                        title="Edit Review"
                        className="h-8 w-8 p-0 cursor-pointer rounded"
                      >
                        <Edit className="h-4 w-4 text-purple-600" />
                      </Button>
                    )}

                    {isAdmin && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(review.id)}
                            title="Delete Review"
                            className="h-8 w-8 p-0 cursor-pointer rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Delete this review?</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the review from <strong>{review.name}</strong>? This
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

      {/* Compact View Review Modal - Fixed Header */}
      {viewReview && (
        <Dialog open={!!viewReview} onOpenChange={() => setViewReview(null)}>
          <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] flex flex-col rounded p-0">
            {/* Fixed Header */}
            <DialogHeader className="border-b pb-3 px-6 pt-3 shrink-0">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                Review Details
              </DialogTitle>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-6 py-3 space-y-4 flex-1">
              {/* Customer Info */}
              <div className="flex flex-col items-center text-center pb-4 border-b">
                <Image
                  src={viewReview.image}
                  alt={viewReview.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover border-4 border-purple-200 dark:border-purple-800 shadow-lg mb-3 h-40 w-40"
                  unoptimized
                />
                <h3 className="text-lg font-bold mb-1">{viewReview.name}</h3>
                <div className="flex items-center gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < viewReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{viewReview.rating} out of 5 stars</p>
              </div>

              {/* Review Message */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Review Message
                </label>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewReview.review}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded border border-blue-200 dark:border-blue-800">
                  <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1 mb-0.5">
                    <Calendar className="h-2.5 w-2.5" />
                    Review Date
                  </label>
                  <p className="text-sm font-semibold">{viewReview.reviewDate}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded border border-purple-200 dark:border-purple-800">
                  <label className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1 mb-0.5">
                    <Calendar className="h-2.5 w-2.5" />
                    Submitted On
                  </label>
                  <p className="text-sm font-semibold">{formatDate(viewReview.createdAt)}</p>
                </div>

                <div
                  className={`p-2.5 rounded border ${
                    viewReview.isRead
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  }`}
                >
                  <label
                    className={`text-[10px] font-semibold uppercase flex items-center gap-1 mb-0.5 ${
                      viewReview.isRead ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {viewReview.isRead ? <CheckCircle className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
                    Read Status
                  </label>
                  <p className="text-sm font-semibold">{viewReview.isRead ? 'Read' : 'Unread'}</p>
                </div>

                <div
                  className={`p-2.5 rounded border ${
                    viewReview.isDisplay
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <label
                    className={`text-[10px] font-semibold uppercase flex items-center gap-1 mb-0.5 ${
                      viewReview.isDisplay ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {viewReview.isDisplay ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                    Display Status
                  </label>
                  <p className="text-sm font-semibold">{viewReview.isDisplay ? 'Visible' : 'Hidden'}</p>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <DialogFooter className="gap-2 border-t py-3 px-6 shrink-0">
              <Button
                variant="outline"
                onClick={() => handleToggleRead(viewReview)}
                className="cursor-pointer rounded text-sm h-9"
              >
                {viewReview.isRead ? (
                  <>
                    <Circle className="h-3.5 w-3.5 mr-1.5" />
                    Mark as Unread
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Mark as Read
                  </>
                )}
              </Button>
              <DialogClose asChild>
                <Button variant="secondary" className="cursor-pointer rounded text-sm h-9">
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

export default ReviewList;
