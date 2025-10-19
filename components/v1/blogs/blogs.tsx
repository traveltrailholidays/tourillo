import BlogsContainer from '@/components/v1/blogs/blogs-container';
import PageHero from '@/components/v1/page-hero';
import { getPublishedBlogs } from '@/lib/actions/blog-actions';

const Blogs = async () => {
  try {
    const blogPosts = await getPublishedBlogs();
    
    // Transform database results to match interface
    const formattedPosts = blogPosts.map(post => ({
      ...post,
      date: post.date.toISOString(),
    }));

    return (
      <main className="flex min-h-screen flex-col items-center justify-start min-w-screen overflow-x-hidden">
        <PageHero 
          imageUrl="/images/blog/blog.webp" 
          headingText="Tourillo Blogs" 
        />
        <BlogsContainer blogPosts={formattedPosts} />
      </main>
    );
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-start min-w-screen overflow-x-hidden">
        <PageHero 
          imageUrl="/images/blog/blog.webp" 
          headingText="Tourillo Blogs" 
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to load blog posts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please try again later.
          </p>
        </div>
      </main>
    );
  }
};

export default Blogs;
