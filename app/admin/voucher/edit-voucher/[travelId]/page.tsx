import EditVoucherForm from '@/components/admin/edit-voucher-form';
import { getVoucherByTravelId, getAllItinerariesForDropdown } from '@/lib/actions/voucher-actions';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    travelId: string;
  }>;
}

export default async function EditVoucherPage({ params }: PageProps) {
  const { travelId } = await params;

  const voucher = await getVoucherByTravelId(travelId);

  if (!voucher) {
    notFound();
  }

  const itineraries = await getAllItinerariesForDropdown();

  return <EditVoucherForm voucher={voucher} itineraries={itineraries} />;
}
