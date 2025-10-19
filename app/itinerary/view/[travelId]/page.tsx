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

  // Type assertion for JSON fields
  const typedItinerary = {
    ...itinerary,
    days: itinerary.days as Array<{
      dayNumber: number;
      summary: string;
      imageSrc: string;
      description: string;
    }>,
    hotels: itinerary.hotels as Array<{
      placeName: string;
      placeDescription: string;
      hotelName: string;
      roomType: string;
      hotelDescription: string;
    }>,
    inclusions: itinerary.inclusions as Array<{ value: string }>,
    exclusions: itinerary.exclusions as Array<{ value: string }>,
  };

  return <ViewItineraryClient itinerary={typedItinerary} />;
}
