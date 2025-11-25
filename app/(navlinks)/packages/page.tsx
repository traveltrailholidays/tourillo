import Packages from '@/components/v1/packages/packages';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Packages',
  description:
    'Browse and manage all packages available in the Tourillo admin panel. Review package details, pricing, availability, and performance insights to efficiently maintain and optimize your platform’s offerings.',
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

const page = async ({ searchParams }: PageProps) => {
  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;

  return <Packages searchParams={params} />;
};

export default page;
