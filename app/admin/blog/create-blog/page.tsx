import { Metadata } from 'next';
import BlogForm from '@/components/admin/blog-form';

export const metadata: Metadata = {
  title: 'Create New Blog Post',
  description: 'Create a new blog post for Tourillo',
};

export default function CreateBlogPage() {
  return <BlogForm />;
}
