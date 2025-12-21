'use client';

import Section from '../section';
import Container from '../container';
import { Calendar, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useState } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogsContainerProps {
  blogPosts: BlogPost[];
}

const BlogsContainer: React.FC<BlogsContainerProps> = ({ blogPosts }) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <Section className="py-10 sm:py-12 md:py-16 lg:py-20">
      <Container className="w-auto px-4">
        {blogPosts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} formatDate={formatDate} cardVariants={cardVariants} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <h3 className="text-xl font-semibold mb-4">No blog posts found</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new content!</p>
          </motion.div>
        )}
      </Container>
    </Section>
  );
};

interface BlogCardProps {
  post: BlogPost;
  formatDate: (date: string | Date) => string;
  cardVariants: Variants;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, formatDate, cardVariants }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      variants={cardVariants}
      className="bg-foreground rounded overflow-hidden transition duration-300 ease-in-out hover:shadow-lg"
    >
      <div className="relative">
        {/* Image Skeleton */}
        {!imageLoaded && <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse" />}

        <Image
          src={post.image || '/images/hero/hero1.jpg'}
          alt={post.title || 'Blog Post Image'}
          width={400}
          height={250}
          className={`w-full h-52 object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          priority={post.featured}
        />
        <span className="absolute top-2 left-4 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-xs">
          {post.category}
        </span>
        {post.featured && (
          <span className="absolute top-2 right-4 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-xs">
            Featured
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
          <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-4">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {post.author}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(post.date)}
          </div>
        </div>
        <Link
          href={`/blogs/${post.slug}`}
          className="block w-full font-medium text-sm px-4 py-2 rounded-xs text-white bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 cursor-pointer text-center transition-all duration-200"
        >
          Read More
        </Link>
      </div>
    </motion.article>
  );
};

export default BlogsContainer;
