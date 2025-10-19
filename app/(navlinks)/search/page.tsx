import { searchListings } from '@/lib/actions/listing-actions';
import { Suspense } from 'react';
import SearchBar from '@/components/v1/search/search-bar';
import PackageGrid from '@/components/v1/packages/package-grid';
import Container from '@/components/v1/container';
import Section from '@/components/v1/section';

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPageRoute({ searchParams }: PageProps) {
  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;
  const query = params?.q || '';
  const packages = query ? await searchListings(query) : [];

  return (
    <Section className="py-8 md:py-10">
      <Container className="w-full">
        <div className="mb-12">
          {/* Search Bar */}
          <SearchBar initialQuery={query} />

          {query && (
            <p className="text-gray-600 dark:text-gray-400 mt-6 text-center">
              {packages.length > 0
                ? `Found ${packages.length} result${packages.length !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`}
            </p>
          )}
        </div>

        {/* Search Results */}
        {query ? (
          <Suspense fallback={<SearchResultsSkeleton />}>
            <div className="animate-fade-in">
              <PackageGrid
                packages={packages}
                emptyMessage={`No packages found matching "${query}". Try different keywords.`}
              />
            </div>
          </Suspense>
        ) : (
          <EmptySearchState />
        )}
      </Container>
    </Section>
  );
}

function EmptySearchState() {
  return (
    <div className="text-center py-20">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-lg font-medium">Start typing to see packages...</p>
        <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">
          Search by destination, category, or package name
        </p>
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
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
