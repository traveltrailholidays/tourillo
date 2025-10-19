import type { Metadata } from 'next';
import Payments from '@/components/v1/payments/payments';

export const metadata: Metadata = {
  title: 'Payments',
  description:
    'Secure and convenient payment options with Tourillo Pvt Ltd. Easily complete your bookings for personalized India tour packages with confidence. We ensure safe transactions and hassle-free processing for a seamless travel planning experience.',
};

const page = () => {
  return <Payments />;
};

export default page;
