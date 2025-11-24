import PackageList from '@/components/package-list';
import { getAllListings } from '@/lib/actions/listing-actions';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Package List',
  description:
    'View and manage all travel packages in the Tourillo admin panel. Access package details, pricing, destinations, and itineraries to efficiently oversee and update your platform’s offerings.',
};

const page = async () => {
  const listings = await getAllListings();

  // Convert dates to strings for client component
  const packagesData = listings.map((listing) => ({
    ...listing,
    createdAt: listing.createdAt.toISOString(),
  }));
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Packages</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all packages</p>
      </div>
      <PackageList packages={packagesData} />
    </div>
  );
};

export default page;
