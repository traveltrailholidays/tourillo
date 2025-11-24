import { getItineraryByTravelId } from '@/lib/actions/itinerary-actions';
import { notFound } from 'next/navigation';
import ViewItineraryClient from '@/components/itinerary/view-itinerary-client';

interface PageProps {
  params: Promise<{
    travelId: string;
  }>;
}

export default async function ViewItineraryPage({ params }: PageProps) {
  const { travelId } = await params;
  const itinerary = await getItineraryByTravelId(travelId.toUpperCase());

  if (!itinerary) {
    notFound();
  }

  return <ViewItineraryClient itinerary={itinerary} />;
}
