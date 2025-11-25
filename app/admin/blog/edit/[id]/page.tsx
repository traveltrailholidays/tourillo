import BlogForm from '@/components/admin/blog-form';
import { getBlogById } from '@/lib/actions/blog-actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Blog Post',
  description:
    'Easily edit and update existing blog posts in the Tourillo admin panel. Modify content, titles, categories, and publication details to keep your platform’s blog accurate and engaging.',
};

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
  );
};

export default page;
