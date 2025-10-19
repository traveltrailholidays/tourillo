import { Metadata } from 'next';
import Blogs from '@/components/v1/blogs/blogs';

export const metadata: Metadata = {
  title: 'Blogs',
  description:
    'Explore travel stories, tips, destination guides, and insider insights on the Tourillo blog. Stay inspired and informed for your next adventure across India and beyond.',
};

export const dynamic = 'force-dynamic';

const page = () => {
  return <Blogs />;
};

export default page;
