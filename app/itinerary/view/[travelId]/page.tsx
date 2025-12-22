import { getItineraryByTravelId } from '@/lib/actions/itinerary-actions';
import { notFound } from 'next/navigation';
import ViewItineraryClient from '@/components/itinerary/view-itinerary-client';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    travelId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { travelId } = await params;

  try {
    const itinerary = await getItineraryByTravelId(travelId);

    if (!itinerary) {
      return {
        title: 'itinerary Not Found',
        description: 'The requested itinerary could not be found',
      };
    }

    let brand = '';
    if (itinerary.travelId.startsWith('TRL')) {
      brand = 'Tourillo';
    } else if (itinerary.travelId.startsWith('TTH')) {
      brand = 'Travel Trail Holidays';
    }

    return {
      title: {
        absolute: `${itinerary.clientName} - ${itinerary.travelId} - ${brand}`,
      },
      description: `Travel itinerary for ${itinerary.clientName}`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'itinerary Not Found',
      description: 'The requested itinerary could not be found',
    };
  }
}

export default async function ViewItineraryPage({ params }: PageProps) {
  const { travelId } = await params;
  const itinerary = await getItineraryByTravelId(travelId.toUpperCase());

  if (!itinerary) {
    notFound();
  }

  return <ViewItineraryClient itinerary={itinerary} />;
}
