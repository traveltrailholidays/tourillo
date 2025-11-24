'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PackageCard from '../packages/package-card';
import SectionHeading from '../section-heading';
import { SafeListing } from '@/types';

interface WeekendTripsClientProps {
  packages: SafeListing[];
  wishlistIds: string[];
  showViewAll: boolean;
}

const WeekendTripsClient = ({ packages, wishlistIds, showViewAll }: WeekendTripsClientProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="flex items-center mb-8 sm:mb-10"
      >
        <SectionHeading mainHeading="Weekend Trips" subHeading="Perfect Getaways for Weekends" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
      >
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} data={pkg} initialLiked={wishlistIds.includes(pkg.id)} background="background" />
        ))}
      </motion.div>

      {showViewAll && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="/packages?category=weekend"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded hover:opacity-90 transition-opacity shadow-lg group"
          >
            View All
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}
    </>
  );
};

export default WeekendTripsClient;
