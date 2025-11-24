import { getBlogBySlug, getBlogsByCategory } from '@/lib/actions/blog-actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Container from '@/components/v1/container';
import Section from '@/components/v1/section';
import { Blog } from '@prisma/client';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.published) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${blog.title}`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.image ? [{ url: blog.image }] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.published) {
    notFound();
  }

  const relatedPosts = await getBlogsByCategory(blog.category);
  const filteredRelatedPosts = relatedPosts
    .filter((post: Blog) => post.slug !== blog.slug && post.published)
    .slice(0, 3);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Section>
      <Container className="min-h-screen bg-background w-full">
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <Link
              href="/blogs"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Link>
          </div>
        </header>

        {blog.image && (
          <div className="relative w-full h-[300px] md:h-[400px] mb-12">
            <Image src={blog.image} alt={blog.title} fill className="object-cover" priority />
          </div>
        )}

        <main className="px-4 py-12 mx-auto">
          <article>
            <header className="mb-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded">
                  {blog.category}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {blog.title}
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{blog.excerpt}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(blog.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{blog.readTime}</span>
                </div>
              </div>
            </header>

            {/* Render HTML content from TipTap editor */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                prose-p:mb-4 prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-em:text-gray-700 dark:prose-em:text-gray-300
                prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100
                prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4
                prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4
                prose-li:mb-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>

          {filteredRelatedPosts.length > 0 && (
            <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Posts</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {filteredRelatedPosts.map((post: Blog) => (
                  <Link key={post.id} href={`/blogs/${post.slug}`} className="group block">
                    {post.image && (
                      <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </Container>
    </Section>
  );
}
