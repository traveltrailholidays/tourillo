'use client';

import Image from 'next/image';
import Section from './section';
import { useState } from 'react';

interface PageHeroProps {
  imageUrl: string;
  headingText: string;
}

const PageHero: React.FC<PageHeroProps> = ({ imageUrl, headingText }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Section className="flex flex-col items-center">
      <div className="w-full h-[25vh] lg:h-[35vh] relative overflow-hidden transition-all duration-150">
        {/* Skeleton Placeholder */}
        {isLoading && <div className="absolute inset-0 bg-gray-300 animate-pulse z-0" />}

        {/* Hero Image */}
        <Image
          src={imageUrl}
          width={4240}
          height={2832}
          alt="hero_bg"
          priority
          quality={100}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          className={`w-[100vw] h-full object-cover select-none transition-opacity duration-500 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Overlay */}
        <div className="absolute w-full h-full bg-black top-0 opacity-60 flex justify-center items-center z-10" />

        {/* Text Content */}
        <div className="absolute w-full h-full top-0 flex flex-col gap-10 justify-center items-center z-20 text-center">
          <span className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white transition font-semibold leading-14">
            {headingText}
          </span>
          <div className="max-w-40 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        </div>
      </div>
    </Section>
  );
};

export default PageHero;
