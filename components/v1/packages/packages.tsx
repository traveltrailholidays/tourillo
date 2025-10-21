import { getPublicListings } from '@/lib/actions/listing-actions';
import PageHero from '../page-hero';
import PackageGrid from './package-grid';
import Section from '../section';
import Container from '../container';
import { Suspense } from 'react';
import SectionHeading from '../section-heading';

interface PageProps {
  searchParams: {
    category?: string;
  };
}

const Packages = async ({ searchParams }: PageProps) => {
  const category = searchParams?.category;
  const packages = await getPublicListings(category?.toLowerCase());
  const pageTitle = category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Packages` : 'All Packages';
  const subHeadingText = category
    ? `Explore our ${packages.length} amazing ${category} packages`
    : `Discover amazing travel packages`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start min-w-screen overflow-x-hidden bg-background">
      <PageHero imageUrl="/images/about-us/about.webp" headingText="Packages" />
      <Section className="py-20 px-4">
        <Container className="w-full">
          <div className="mb-10">
            <SectionHeading mainHeading={pageTitle} subHeading={subHeadingText} />
          </div>
          <Suspense fallback={<PackageGridSkeleton />}>
            <PackageGrid
              packages={packages}
              emptyMessage={
                category ? `No ${category} packages available at the moment` : 'No packages available at the moment'
              }
            />
          </Suspense>
        </Container>
      </Section>
    </main>
  );
};

function PackageGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-300 dark:bg-gray-700 h-[200px] rounded-t"></div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-b space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Packages;
