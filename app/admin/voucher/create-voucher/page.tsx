import CreateVoucherForm from '@/components/admin/create-voucher-form';
import { getAllItinerariesForDropdown } from '@/lib/actions/voucher-actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Voucher',
  description:
    'Easily create new travel vouchers in the Tourillo admin panel. Set voucher details, discounts, validity dates, and applicable packages to efficiently manage promotional offers for your travelers.',
};

export default async function CreateVoucherPage() {
  const itineraries = await getAllItinerariesForDropdown();

  return <CreateVoucherForm itineraries={itineraries} />;
}
