'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, CheckCircle, XCircle, Star } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const PAGE_SIZE = 10;

  const filtered = useMemo(
    () =>
      blogs.filter((b) => [b.title, b.category, b.author].some((v) => v.toLowerCase().includes(search.toLowerCase()))),
    [search, blogs]
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;

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

  return (
    <div className="rounded bg-foreground p-3 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          className="w-full px-3 py-2 rounded bg-background text-sm md:text-base"
          placeholder="Search blogs..."
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
              <TableHead className="text-primary">Author</TableHead>
              <TableHead className="text-primary">Read</TableHead>
              <TableHead className="text-primary">Featured</TableHead>
              <TableHead className="text-primary">Published</TableHead>
              <TableHead className="text-primary">Created</TableHead>
              <TableHead className="text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No blogs found.
                </TableCell>
              </TableRow>
            )}
            {pageData.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell>
                  <Link href={`/blogs/${blog.slug}`} className="hover:underline capitalize font-medium">
                    {blog.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="capitalize text-sm px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
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
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-500">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">No</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm">{formatDate(blog.createdAt)}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/admin/blog/edit/${blog.id}`}>
                    <Button size="icon" variant="ghost" title="Edit">
                      <Pencil className="h-4 w-4 text-purple-600" />
                    </Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(blog.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete this blog?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this blog post? This action cannot be undone.
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
        {pageData.length === 0 && <div className="text-center py-8 text-sm">No blogs found.</div>}
        {pageData.map((blog) => (
          <div key={blog.id} className="rounded-lg border p-4 space-y-3 bg-background">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link href={`/blogs/${blog.slug}`} className="hover:underline">
                  <h3 className="font-semibold text-base capitalize truncate">{blog.title}</h3>
                </Link>
                <span className="inline-block mt-1 capitalize text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                  {blog.category}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Link href={`/admin/blog/edit/${blog.id}`}>
                  <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit">
                    <Pencil className="h-4 w-4 text-purple-600" />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setDeleteId(blog.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Delete this blog?</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this blog post? This action cannot be undone.
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

            {/* Blog details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Author:</span>
                <span>{blog.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Read Time:</span>
                <span>{blog.readTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Featured:</span>
                {blog.featured ? (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="h-4 w-4 fill-current" />
                    <span>Yes</span>
                  </div>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Published:</span>
                {blog.published ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Yes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <XCircle className="h-4 w-4" />
                    <span>No</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <span>{formatDate(blog.createdAt)}</span>
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

export default BlogList;
