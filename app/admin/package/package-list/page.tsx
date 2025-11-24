import { getAllListings } from '@/lib/actions/listing-actions';
import PackageList from '@/components/package-list';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const page = async () => {
  const listings = await getAllListings();

  // Convert dates to strings for client component
  const packagesData = listings.map((listing) => ({
    ...listing,
    createdAt: listing.createdAt.toISOString(),
  }));
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">All Packages</h1>
        <Link href="/admin/package/create-package">
          <Button className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white cursor-pointer rounded">
            Create Package
          </Button>
        </Link>
      </div>
      <PackageList packages={packagesData} />
    </div>
  );
};

export default page;
