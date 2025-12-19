import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PackageGrid from '@/components/v1/packages/package-grid';
import Container from '@/components/v1/container';
import Section from '@/components/v1/section';
import PageHero from '@/components/v1/page-hero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlist',
  description:
    'View and manage your saved trips and favorite destinations in the Tourillo wishlist. Easily revisit, compare, and plan the experiences you love for your next adventure.',
};

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { wishlistId: true },
  });

  const wishlistIds = user?.wishlistId || [];

  const packages = await prisma.listing.findMany({
    where: {
      id: {
        in: wishlistIds,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // ✅ Convert to SafeListing format with all required fields
  const safePackages = packages.map((pkg) => ({
    ...pkg,
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt ? pkg.updatedAt.toISOString() : pkg.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-[80vh] bg-background">
      <PageHero imageUrl="/images/about-us/about.webp" headingText="Wishlist" />
      <Section className="py-16">
        <Container className="w-full">
          <PackageGrid
            packages={safePackages}
            emptyMessage="Your wishlist is currently empty. Start browsing to discover and save your favorite packages."
          />
        </Container>
      </Section>
    </main>
  );
}
