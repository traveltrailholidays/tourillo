import EditVoucherForm from '@/components/admin/edit-voucher-form';
import { getVoucherById, getAllItinerariesForDropdown } from '@/lib/actions/voucher-actions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Voucher',
  description: 'Edit voucher details',
};

interface EditVoucherPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVoucherPage({ params }: EditVoucherPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const [voucher, itineraries] = await Promise.all([getVoucherById(id), getAllItinerariesForDropdown()]);

  if (!voucher) {
    notFound();
  }

  return <EditVoucherForm voucher={voucher} itineraries={itineraries} />;
}
