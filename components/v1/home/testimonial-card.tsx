'use client';

import React from 'react';
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
  return (
    <div className="flex flex-col pt-10 relative w-full h-full">
      {/* Profile image */}
      <div className="w-16 h-16 absolute top-3 bg-background left-6 flex justify-center items-center rounded-full overflow-hidden">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      {/* Card content */}
      <div className="flex flex-col flex-grow bg-foreground pt-16 px-6 pb-6 w-full gap-4 rounded rounded-tl-none h-full">
        <h5 className="text-3xl font-medium">{name}</h5>
        <p className="text-lg text-gray-700 dark:text-gray-300">{review}</p>

        <div className="flex justify-between items-center mt-auto">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Reviewed on {reviewDate}</span>
        </div>
      </div>
    </div>
  );
};

export default Testimonialcard;
