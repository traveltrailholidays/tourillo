import Link from 'next/link';

import { BlogList } from '@/components/admin/blog-list';
import { Button } from '@/components/ui/button';
import { getAllBlogs } from '@/lib/actions/blog-actions';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog List',
  description:
    'View and manage all blog posts in the Tourillo admin panel. Access post titles, authors, categories, and publication dates to efficiently oversee and update your platform’s content.',
};

const page = async () => {
  const blogs = await getAllBlogs();
  // Serialize Date objects to strings
  const serializedBlogs = blogs.map((blog) => ({
    ...blog,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    date: blog.date.toISOString(),
  }));
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 ">All Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage all blog posts in one place</p>
        </div>
      </div>
      <BlogList blogs={serializedBlogs} />
    </div>
  );
};

export default page;
