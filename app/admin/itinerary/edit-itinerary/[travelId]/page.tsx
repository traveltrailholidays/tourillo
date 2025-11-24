import EditItineraryForm from '@/components/admin/edit-itinerary-form';
import { getItineraryByTravelId } from '@/lib/actions/itinerary-actions';
import { notFound } from 'next/navigation';

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
