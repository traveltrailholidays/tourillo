import EditItineraryForm from '@/components/admin/edit-itinerary-form';
import { getItineraryByTravelId } from '@/lib/actions/itinerary-actions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Itinerary',
  description:
    'Easily update and refine travel itineraries in the Tourillo admin panel. Modify destinations, schedules, activities, and other details to keep travel plans accurate and up-to-date.',
};

interface PageProps {
  params: Promise<{
    travelId: string;
  }>;
}

export default async function EditItineraryPage({ params }: PageProps) {
  // Await params in Next.js 15+
  const { travelId } = await params;

  const itinerary = await getItineraryByTravelId(travelId);

  if (!itinerary) {
    notFound();
  }

  return <EditItineraryForm itinerary={itinerary} />;
}
