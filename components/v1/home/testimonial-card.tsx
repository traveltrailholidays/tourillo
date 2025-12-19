// components/v1/home/testimonial-card.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface TestimonialcardProps {
  name: string;
  review: string;
  rating: number;
  image: string;
  reviewDate: string;
}

const Testimonialcard: React.FC<TestimonialcardProps> = ({ name, review, rating, image, reviewDate }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use default avatar if image error or no image
  const imageSrc = imageError || !image ? '/images/avatar.webp' : image;

  return (
    <div className="flex flex-col pt-10 relative w-full h-full">
      {/* Profile image */}
      <div className="w-16 h-16 absolute top-3 bg-background left-6 flex justify-center items-center rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        <Image
          src={imageSrc}
          alt={name}
          width={64}
          height={64}
          className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          unoptimized={imageSrc.startsWith('http')}
        />
        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />}
      </div>

      {/* Card content */}
      <div className="flex flex-col grow bg-foreground pt-16 px-6 pb-6 w-full gap-4 rounded rounded-tl-none h-full shadow-md">
        <h5 className="text-2xl md:text-3xl font-medium capitalize truncate">{name}</h5>
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 line-clamp-4">{review}</p>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-auto">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Reviewed on {reviewDate}</span>
        </div>
      </div>
    </div>
  );
};

export default Testimonialcard;
