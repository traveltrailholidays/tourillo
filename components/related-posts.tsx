import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/components/v1/blogs/blogs-container';

interface RelatedPostsProps {
  posts: BlogPost[];
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts }) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Related Articles</h2>
        <Link
          href="/blogs"
          className="flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="bg-foreground rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/blogs/${post.slug}`} className="block">
              <div className="relative aspect-[16/10]">
                <Image src={post.image || '/images/hero/hero01.jpg'} alt={post.title} fill className="object-cover" />
                <span className="absolute top-2 left-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  {post.category}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{post.excerpt}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.date)}
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;
