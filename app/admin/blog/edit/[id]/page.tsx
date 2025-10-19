import BlogForm from '@/components/admin/blog-form';
import { getBlogById } from '@/lib/actions/blog-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  // Await params (Next.js 15+ requirement)
  const { id } = await params;

  // Fetch blog data
  const blog = await getBlogById(id);

  // If blog not found, show 404
  if (!blog) {
    notFound();
  }

  return (
    <div className="">
      <div className="">
        {/* Back button */}
        <Link
          href="/admin/blog/blog-list"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-6 py-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Link>

        {/* Blog Form with initial data */}
        <BlogForm
          initialData={{
            id: blog.id,
            title: blog.title,
            excerpt: blog.excerpt,
            content: blog.content,
            image: blog.image || undefined,
            category: blog.category,
            author: blog.author,
            readTime: blog.readTime,
            featured: blog.featured,
            published: blog.published,
          }}
        />
      </div>
    </div>
  );
};

export default page;
