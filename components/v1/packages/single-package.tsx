import Container from '@/components/v1/container';
import Section from '@/components/v1/section';
import { SafeListing } from '@/types';
import Image from 'next/image';
import React from 'react';
import { MdWatchLater } from 'react-icons/md';
import { FaStar, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import LikeButton from '@/components/like-button';
import FaqPackageAccordion from './faq-accordion';
import GetHelp from '../get-help';
import PackageQuoteForm from './package-quote-form';

interface SinglePackageProps {
  listing: SafeListing;
  initialLiked?: boolean;
}

const SinglePackage: React.FC<SinglePackageProps> = ({ listing, initialLiked = false }) => {
  return (
    <Section className="py-8">
      <Container className="w-full flex flex-col gap-8">
        {/* Hero Image with Like Button */}
        <div className="w-full h-[300px] md:h-[60vh] overflow-hidden rounded relative">
          <Image
            fill
            src={listing.imageSrc || '/placeholder-image.jpg'}
            alt={listing.title}
            className="object-cover w-full transition-transform duration-500"
            priority
          />

          {/* Like Button */}
          <div className="absolute top-5 right-5 z-10">
            <LikeButton listingId={listing.id} initialLiked={initialLiked} />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Left Column - Package Details */}
          <div className="w-full flex flex-col gap-16">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-semibold leading-tight capitalize">{listing.title}</h1>
            </div>

            {/* Location and Duration - Added Rating and Category */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <MdWatchLater size={20} />
                <span className="font-medium">
                  {listing.nights} Nights / {listing.days} Days
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt size={18} className="text-red-500" />
                <span className="font-medium capitalize text-gray-900 dark:text-white">{listing.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar size={18} className="text-yellow-500" />
                <span className="font-medium text-gray-900 dark:text-white">{listing.rating.toFixed(1)} Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <FaTag size={18} className="text-purple-600 dark:text-purple-400" />
                <span className="font-medium capitalize text-gray-900 dark:text-white">{listing.category}</span>
              </div>
            </div>

            {/* Package Description */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white">Package description</h2>
              <p className="text-lg">{listing.description}</p>
            </div>

            {/* Itinerary */}
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl md:text-3xl font-medium">Itinerary</h2>
              <div className="space-y-4">
                {listing.itinary.map((item, index) => (
                  <div key={index} className="py-2 rounded transition">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg mb-2">
                          <span className="font-bold">Day {index + 1} : </span>
                          {item}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <FaqPackageAccordion />
            </div>
          </div>

          {/* Right Column - Quote Form */}
          <div className="lg:max-w-[420px] w-full flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            {/* Quote Form - Pass package title as destination */}
            <PackageQuoteForm
              packageTitle={listing.title}
              price={listing.price}
              discount={listing.discount}
              days={listing.days}
            />

            {/* Help Card */}
            <GetHelp />
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default SinglePackage;
