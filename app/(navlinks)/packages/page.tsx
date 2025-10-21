import Packages from '@/components/v1/packages/packages';
import React from 'react';

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
