import { VoucherList } from '@/components/admin/voucher-list';
import { getAllVouchers } from '@/lib/actions/voucher-actions';

export default async function VoucherListPage() {
  const vouchers = await getAllVouchers();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Travel Vouchers</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all travel vouchers</p>
      </div>
      <VoucherList vouchers={vouchers} />
    </div>
  );
}
