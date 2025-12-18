import ViewVoucherClient from '@/components/voucher/view-voucher-client';
import { getVoucherById } from '@/lib/actions/voucher-actions';
import { getItineraryByTravelId } from '@/lib/actions/itinerary-actions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const voucher = await getVoucherById(id);

    if (!voucher) {
      return {
        title: 'Voucher Not Found',
        description: 'The requested voucher could not be found',
      };
    }

    return {
      title: `${voucher.clientName} - ${voucher.voucherId}`,
      description: `Travel voucher for ${voucher.clientName}`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Voucher Not Found',
      description: 'The requested voucher could not be found',
    };
  }
}

export default async function ViewVoucherPage({ params }: PageProps) {
  const { id } = await params;

  console.log('Attempting to fetch voucher with ID:', id);

  try {
    // Get voucher by database ID
    const voucher = await getVoucherById(id);

    if (!voucher) {
      console.error('Voucher not found for id:', id);
      notFound();
    }

    console.log('Voucher found:', voucher.voucherId);
    console.log('Fetching itinerary with travelId:', voucher.itineraryTravelId);

    // Fetch itinerary data to get additional information and company type
    const itinerary = await getItineraryByTravelId(voucher.itineraryTravelId);

    if (!itinerary) {
      console.error('Itinerary not found for travelId:', voucher.itineraryTravelId);
      notFound();
    }

    console.log('Itinerary found:', itinerary.travelId);

    return (
      <ViewVoucherClient
        voucher={voucher}
        company={itinerary.company}
        itinerary={{
          packageTitle: itinerary.packageTitle,
          clientPhone: itinerary.clientPhone,
          clientEmail: itinerary.clientEmail,
          tripAdvisorName: itinerary.tripAdvisorName,
          tripAdvisorNumber: itinerary.tripAdvisorNumber,
        }}
      />
    );
  } catch (error) {
    console.error('Error loading voucher page:', error);
    notFound();
  }
}
