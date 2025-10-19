import { getListingById } from '@/lib/actions/listing-actions';
import SinglePackage from '@/components/v1/packages/single-package';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PackageDetailPage({ params }: PageProps) {
  // Await params (Next.js 15+ requirement)
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  // Get user's wishlist
  const session = await auth();
  let initialLiked = false;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wishlistId: true },
    });
    initialLiked = user?.wishlistId.includes(listing.id) || false;
  }

  // Convert to SafeListing format
  const safeListing = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    imageSrc: listing.imageSrc,
    category: listing.category,
    price: listing.price,
    location: listing.location,
    days: listing.days,
    nights: listing.nights,
    rating: listing.rating,
    discount: listing.discount,
    itinary: listing.itinary,
    createdAt: listing.createdAt.toISOString(),
  };

  return <SinglePackage listing={safeListing} initialLiked={initialLiked} />;
}
