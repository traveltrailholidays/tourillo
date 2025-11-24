import CreateVoucherForm from '@/components/admin/create-voucher-form';
import { getAllItinerariesForDropdown } from '@/lib/actions/voucher-actions';

export default async function CreateVoucherPage() {
  const itineraries = await getAllItinerariesForDropdown();

  return <CreateVoucherForm itineraries={itineraries} />;
}
