import Container from '../container';
import Section from '../section';
import SectionHeading from '../section-heading';
import { getWeekendListings } from '@/lib/actions/listing-actions';
import PackageCard from '../packages/package-card';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const WeekendTrips = async () => {
  const packages = await getWeekendListings();

  // Get user's wishlist if logged in
  const session = await auth();
  let wishlistIds: string[] = [];

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wishlistId: true },
    });
    wishlistIds = user?.wishlistId || [];
  }

  if (packages.length === 0) {
    return null; // Don't show section if no weekend packages
  }

  return (
    <Section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-foreground">
      <Container className="w-full">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading 
            mainHeading="Weekend Trips" 
            subHeading="Perfect Short Getaways for the Weekend" 
          />
          <Link
            href="/packages?category=weekend"
            className="hidden md:flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors group"
          >
            View All
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-all duration-200">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              data={pkg}
              initialLiked={wishlistIds.includes(pkg.id)}
              background='background'
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/packages?category=weekend"
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold rounded hover:opacity-90 transition-opacity"
          >
            View All
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default WeekendTrips;
