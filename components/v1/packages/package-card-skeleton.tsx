import React from 'react';

interface PackageCardSkeletonProps {
  background?: string;
}

const PackageCardSkeleton: React.FC<PackageCardSkeletonProps> = ({ background = 'foreground' }) => {
  return (
    <article className={`bg-${background} rounded overflow-hidden animate-pulse`}>
      {/* Image Skeleton */}
      <div className="relative bg-gray-300 dark:bg-gray-700 h-52 w-full" />

      <div className="p-3">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-3 w-1/2" />

        {/* Location Skeleton */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3 w-1/3" />

        {/* Duration and Amenities Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32" />
          <div className="flex gap-2">
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </div>

        {/* Price Skeleton */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-20" />
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16" />
        </div>

        {/* Button Skeleton */}
        <div className="flex gap-3">
          <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-xs" />
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xs flex-1" />
        </div>
      </div>
    </article>
  );
};

export default PackageCardSkeleton;
