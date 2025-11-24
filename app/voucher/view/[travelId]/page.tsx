import ViewVoucherClient from '@/components/voucher/view-voucher-client';
import { getVoucherByTravelId } from '@/lib/actions/voucher-actions';
import { getItineraryByTravelId } from '@/lib/actions/itinerary-actions';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    travelId: string;
  }>;
}

export default async function ViewVoucherPage({ params }: PageProps) {
  const { travelId } = await params;

  const voucher = await getVoucherByTravelId(travelId);

  if (!voucher) {
    notFound();
  }

  // Fetch itinerary data to get additional information
  const itinerary = await getItineraryByTravelId(travelId);

  return (
    <ViewVoucherClient
      voucher={voucher}
      itinerary={
        itinerary
          ? {
              packageTitle: itinerary.packageTitle,
              clientPhone: itinerary.clientPhone,
              clientEmail: itinerary.clientEmail,
              tripAdvisorName: itinerary.tripAdvisorName,
              tripAdvisorNumber: itinerary.tripAdvisorNumber,
            }
          : undefined
      }
    />
  );
}
