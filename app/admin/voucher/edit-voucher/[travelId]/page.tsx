import EditVoucherForm from '@/components/admin/edit-voucher-form';
import { getVoucherByTravelId, getAllItinerariesForDropdown } from '@/lib/actions/voucher-actions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Voucher',
  description:
    'Easily update and manage travel vouchers in the Tourillo admin panel. Modify voucher details, discounts, validity dates, and applicable packages to keep your promotional offers accurate and up-to-date.',
};

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
