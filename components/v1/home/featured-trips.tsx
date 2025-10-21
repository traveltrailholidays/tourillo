import Container from '../container';
import Section from '../section';
import { getFeaturedListings } from '@/lib/actions/listing-actions';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import FeaturedTripsClient from './featured-trips-client';

const FeaturedTrips = async () => {
  const packages = await getFeaturedListings();

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
    return null;
  }

  return (
    <Section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-foreground">
      <Container className="w-full">
        <FeaturedTripsClient packages={packages} wishlistIds={wishlistIds} />
      </Container>
    </Section>
  );
};

export default FeaturedTrips;
