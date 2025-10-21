'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PackageCard from '../packages/package-card';
import SectionHeading from '../section-heading';
import { SafeListing } from '@/types'; // Import your SafeListing type

interface FeaturedTripsClientProps {
  packages: SafeListing[];
  wishlistIds: string[];
}

const FeaturedTripsClient = ({ packages, wishlistIds }: FeaturedTripsClientProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between mb-8 sm:mb-10"
      >
        <SectionHeading mainHeading="Featured Trips" subHeading="Most Favorite Tour Packages" />

        <Link
          href="/packages?category=featured"
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 dark:from-purple-500/20 dark:to-indigo-500/20 dark:hover:from-purple-500/30 dark:hover:to-indigo-500/30 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold rounded-lg transition-all duration-300 group border border-purple-500/20"
        >
          View All
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
      >
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} data={pkg} initialLiked={wishlistIds.includes(pkg.id)} background="background" />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 flex justify-center md:hidden"
      >
        <Link
          href="/packages?category=featured"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg group"
        >
          View All
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </>
  );
};

export default FeaturedTripsClient;
