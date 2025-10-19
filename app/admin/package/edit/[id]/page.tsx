import ListingForm from '@/components/listing-form';
import { getListingById } from '@/lib/actions/listing-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
        {/* Back button */}
        <Link
          href="/admin/package/package-list"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-6 py-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Packages
        </Link>

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
