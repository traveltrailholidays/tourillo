import ListingForm from '@/components/listing-form';
import { getListingById } from '@/lib/actions/listing-actions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Package',
  description:
    'Modify existing travel packages in the Tourillo admin panel. Update package details, pricing, destinations, and itineraries to keep your offerings accurate and up-to-date.',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPackagePage({ params }: PageProps) {
  // Await params (Next.js 15+ requirement)
  const { id } = await params;

  // Fetch package data
  const listing = await getListingById(id);

  // If package not found, show 404
  if (!listing) {
    notFound();
  }

  // Parse itinary if it's JSON
  let parsedItinary: string[] = [];
  try {
    if (typeof listing.itinary === 'string') {
      parsedItinary = JSON.parse(listing.itinary);
    } else if (Array.isArray(listing.itinary)) {
      parsedItinary = listing.itinary;
    } else {
      parsedItinary = listing.itinary as string[];
    }
  } catch (error) {
    console.error('Error parsing itinary:', error);
    parsedItinary = [];
  }

  return (
    <div>
      <div>
        {/* Listing Form with initial data */}
        <ListingForm
          initialData={{
            id: listing.id,
            title: listing.title,
            description: listing.description,
            imageSrc: listing.imageSrc || undefined,
            category: listing.category,
            location: listing.location,
            price: listing.price,
            days: listing.days,
            nights: listing.nights,
            rating: listing.rating,
            discount: listing.discount,
            itinary: parsedItinary,
          }}
        />
      </div>
    </div>
  );
}
