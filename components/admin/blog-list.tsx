'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
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
    <div className="rounded bg-foreground p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          className="w-full md:max-w-xs px-3 py-2 rounded bg-background"
          placeholder="Search by title, category, or author..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>
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
                <Link href={`/blogs/${blog.slug}`} className="hover:underline capitalize">
                  {blog.title}
                </Link>
              </TableCell>
              <TableCell>{blog.category}</TableCell>
              <TableCell>{blog.author}</TableCell>
              <TableCell>{blog.readTime}</TableCell>
              <TableCell>
                {blog.featured ? (
                  <span className="text-green-600 font-medium">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </TableCell>
              <TableCell>
                {blog.published ? (
                  <span className="text-green-600 font-medium">Yes</span>
                ) : (
                  <span className="text-red-500 font-medium">No</span>
                )}
              </TableCell>
              <TableCell>{formatDate(blog.createdAt)}</TableCell>
              <TableCell className="flex gap-2">
                <Link href={`/admin/blog/edit/${blog.id}`}>
                  <Button size="icon" variant="ghost">
                    <Pencil className="h-4 w-4 text-purple-600" />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(blog.id)}>
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

export default BlogList;
