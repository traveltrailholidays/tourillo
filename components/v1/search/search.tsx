import { searchListings } from '@/lib/actions/listing-actions';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import SearchBar from './search-bar';
import PackageGrid from '../packages/package-grid';

interface PageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || '';
  const packages = query ? await searchListings(query) : [];

  return (
    <main className="flex min-h-screen flex-col items-center justify-start min-w-screen overflow-x-hidden bg-background">
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/packages"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Packages
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Search Results
          </h1>
          
          {/* Search Bar */}
          <SearchBar initialQuery={query} />

          {query && (
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              {packages.length > 0 
                ? `Found ${packages.length} result${packages.length !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`
              }
            </p>
          )}
        </div>

        {/* Search Results */}
        {query ? (
          <Suspense fallback={<SearchResultsSkeleton />}>
            <PackageGrid
              packages={packages} 
              emptyMessage={`No packages found matching "${query}". Try different keywords.`}
            />
          </Suspense>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Enter a search query to find packages
            </p>
          </div>
        )}
      </div>
    </main>
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
