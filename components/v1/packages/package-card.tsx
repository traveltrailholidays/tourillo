'use client';

import { SafeListing } from '@/types';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { MdWatchLater } from 'react-icons/md';
import { GiForkKnifeSpoon } from 'react-icons/gi';
import { FaBuilding } from 'react-icons/fa6';
import { FaCarAlt, FaStar } from 'react-icons/fa';
import Link from 'next/link';
import LikeButton from '@/components/like-button';

interface PackageCardProps {
  data: SafeListing;
  initialLiked?: boolean;
  background?: string;
}

const PackageCard: React.FC<PackageCardProps> = ({ data, initialLiked = false, background = 'foreground' }) => {
  const discountedPrice = useMemo(() => {
    if (data.discount > 0) {
      return Math.round(data.price - data.price * (data.discount / 100));
    }
    return data.price;
  }, [data.price, data.discount]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const likeBg = background === 'foreground' ? 'background' : 'foreground';

  return (
    <article className={`bg-${background} rounded overflow-hidden transition duration-300 ease-in-out hover:shadow-lg`}>
      <div className="relative">
        <Image
          src={data.imageSrc || '/images/hero/hero01.jpg'}
          alt={data.title}
          width={400}
          height={250}
          className="w-full h-52 object-cover"
          unoptimized
        />

        {/* Category Badge */}
        <span className="absolute top-2 left-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-xs capitalize">
          {data.category}
        </span>

        {/* Discount Badge */}
        {data.discount > 0 && (
          <span className="absolute top-2 right-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-xs">
            {data.discount}% OFF
          </span>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-2 right-4 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-xs flex items-center gap-1">
          <FaStar className="h-3 w-3" />
          {data.rating.toFixed(1)}
        </div>
      </div>

      <div className="p-3">
        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-purple-600 transition-colors capitalize">
          <Link href={`/packages/${data.id}`}>{data.title}</Link>
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-3">
          {/* <FaMapLocationDot className="h-4 w-4 text-purple-500" /> */}
          <span className="text-red-400 font-medium">{data.location}</span>
        </div>

        {/* Duration and Amenities */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold mb-4">
          <div className="flex items-center gap-1">
            <MdWatchLater className="h-4 w-4" />
            <span>
              {data.nights} Nights / {data.days} Days
            </span>
          </div>
          <div className="flex gap-2 text-gray-500 dark:text-gray-400">
            <FaBuilding className="h-4 w-4" title="Hotel" />
            <FaCarAlt className="h-4 w-4" title="Transport" />
            <GiForkKnifeSpoon className="h-4 w-4" title="Meals" />
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.discount > 0 ? (
              <>
                <span className="text-gray-500 dark:text-gray-400 text-xs line-through">{formatPrice(data.price)}</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatPrice(discountedPrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{formatPrice(data.price)}</span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">per person</span>
        </div>

        {/* View Details Button */}
        <div className="flex gap-3">
          <LikeButton backgroundColor={likeBg} listingId={data.id} initialLiked={initialLiked} />
          <Link
            href={`/packages/${data.id}`}
            className="block w-full font-medium text-sm px-4 py-2 rounded-xs text-white bg-gradient-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 cursor-pointer text-center transition-all duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PackageCard;
