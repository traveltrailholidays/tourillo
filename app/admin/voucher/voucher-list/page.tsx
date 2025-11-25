import { VoucherList } from '@/components/admin/voucher-list';
import { getAllVouchers } from '@/lib/actions/voucher-actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voucher List',
  description:
    'View and manage all travel vouchers in the Tourillo admin panel. Access voucher details, discounts, validity dates, and applicable packages to efficiently oversee promotional offers.',
};

export default async function VoucherListPage() {
  const vouchers = await getAllVouchers();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Vouchers</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all travel vouchers</p>
      </div>
      <VoucherList vouchers={vouchers} />
    </div>
  );
}
