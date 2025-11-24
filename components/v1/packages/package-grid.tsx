'use client';

import { SafeListing } from '@/types';
import PackageCard from './package-card';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { FaArrowRightLong } from 'react-icons/fa6';

interface PackageGridProps {
  packages: SafeListing[];
  title?: string;
  emptyMessage?: string;
}

const PackageGrid: React.FC<PackageGridProps> = ({ packages, title, emptyMessage = 'No packages available' }) => {
  const { user } = useAuthStore();
  const wishlistIds = user?.wishlistId || [];

  if (packages.length === 0) {
    return (
      <div className="py-2">
        <p className="text-gray-500 dark:text-gray-400 text-lg">{emptyMessage}</p>
        <Link
          href="/packages"
          className="mt-5 bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 w-fit px-3 py-2 rounded text-white font-semibold flex gap-5 items-center"
        >
          Explore Packages <FaArrowRightLong />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} data={pkg} initialLiked={wishlistIds.includes(pkg.id)} />
        ))}
      </div>
    </div>
  );
};

export default PackageGrid;
