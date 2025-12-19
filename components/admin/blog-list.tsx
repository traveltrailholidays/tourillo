'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Search,
  X,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { deleteBlog } from '@/lib/actions/blog-actions';
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
import { useSession } from 'next-auth/react';

export interface Blog {
  id: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  slug: string;
}

interface BlogListProps {
  blogs: Blog[];
}

type SortField = 'title' | 'category' | 'author' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;
type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'FEATURED';

// Helper function to format date to dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const BlogList: React.FC<BlogListProps> = ({ blogs }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  // Check if user is admin
  const isAdmin = session?.user?.isAdmin || false;

  // Statistics
  const stats = useMemo(() => {
    const publishedCount = blogs.filter((b) => b.published).length;
    const draftCount = blogs.filter((b) => !b.published).length;
    const featuredCount = blogs.filter((b) => b.featured).length;

    return {
      total: blogs.length,
      published: publishedCount,
      draft: draftCount,
      featured: featuredCount,
    };
  }, [blogs]);

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
    let result = blogs;

    // Status Filter
    if (statusFilter === 'PUBLISHED') {
      result = result.filter((b) => b.published);
    } else if (statusFilter === 'DRAFT') {
      result = result.filter((b) => !b.published);
    } else if (statusFilter === 'FEATURED') {
      result = result.filter((b) => b.featured);
    }

    // Search Filter
    if (search.trim()) {
      result = result.filter((b) =>
        [b.title, b.category, b.author].some((v) => v.toLowerCase().includes(search.toLowerCase()))
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
  }, [search, blogs, statusFilter, sortField, sortDirection]);

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

    if (!isAdmin) {
      toast.error('Only admins can delete blogs');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBlog(deleteId);
      toast.success('Blog deleted successfully!');
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog');
    } finally {
      setIsDeleting(false);
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
              placeholder="Search by title, category, or author..."
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
              All Blogs <span className="ml-1 text-xs opacity-80">({stats.total})</span>
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'PUBLISHED' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('PUBLISHED');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${
                statusFilter === 'PUBLISHED' ? 'bg-green-500 hover:bg-green-600' : ''
              }`}
            >
              Published <span className="ml-1 text-xs opacity-80">({stats.published})</span>
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('DRAFT');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${statusFilter === 'DRAFT' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
            >
              Draft <span className="ml-1 text-xs opacity-80">({stats.draft})</span>
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'FEATURED' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('FEATURED');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${
                statusFilter === 'FEATURED' ? 'bg-yellow-500 hover:bg-yellow-600' : ''
              }`}
            >
              Featured <span className="ml-1 text-xs opacity-80">({stats.featured})</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="px-4 py-3 bg-linear-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Blogs</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Published</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Draft</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Featured</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span>
              Showing {filtered.length} of {stats.total} blogs
            </span>
            {statusFilter !== 'ALL' && (
              <span
                className={`px-2 py-1 rounded ${
                  statusFilter === 'PUBLISHED'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : statusFilter === 'DRAFT'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
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
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[250px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Title
                  <SortIcon field="title" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Category
                  <SortIcon field="category" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('author')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Author
                  <SortIcon field="author" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px]">Read Time</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px]">Featured</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px]">Status</TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Created
                  <SortIcon field="createdAt" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 text-right min-w-[150px] sticky right-0 bg-gray-50 dark:bg-gray-800 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {search || statusFilter !== 'ALL' ? 'No blogs found matching your filters' : 'No blogs found'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {pageData.map((blog) => (
              <TableRow key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <TableCell>
                  <p className="font-medium capitalize line-clamp-2">{blog.title}</p>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 capitalize">
                    {blog.category}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{blog.author}</TableCell>
                <TableCell className="text-sm">{blog.readTime}</TableCell>
                <TableCell>
                  {blog.featured ? (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">Yes</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No</span>
                  )}
                </TableCell>
                <TableCell>
                  {blog.published ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                      <XCircle className="h-3 w-3" />
                      Draft
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatDate(blog.createdAt)}</TableCell>
                <TableCell className="sticky right-0 bg-white dark:bg-gray-900 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/blogs/${blog.slug}`} target="_blank">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="View Blog"
                        className="h-8 w-8 p-0 cursor-pointer rounded"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>

                    <Link href={`/admin/blog/edit/${blog.id}`}>
                      <Button size="sm" variant="ghost" title="Edit" className="h-8 w-8 p-0 cursor-pointer rounded">
                        <Pencil className="h-4 w-4 text-purple-600" />
                      </Button>
                    </Link>

                    {isAdmin && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(blog.id)}
                            title="Delete (Admin Only)"
                            className="h-8 w-8 p-0 cursor-pointer rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded">
                          <DialogHeader>
                            <DialogTitle>Delete this blog?</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "<strong>{blog.title}</strong>"? This action cannot be
                              undone.
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
    </div>
  );
};

export default BlogList;
