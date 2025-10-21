import { BlogList } from '@/components/admin/blog-list';
import { Button } from '@/components/ui/button';
import { getAllBlogs } from '@/lib/actions/blog-actions';
import Link from 'next/link';
import React from 'react';

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
        <h1 className="text-2xl font-bold mb-4">All Blogs</h1>
        <Link href="/admin/blog/create-blog">
          <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white cursor-pointer rounded">
            Create Blog
          </Button>
        </Link>
      </div>
      <BlogList blogs={serializedBlogs} />
    </div>
  );
};

export default page;
