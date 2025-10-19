import { Metadata } from 'next';
import Rncp from '@/components/v1/legal/rncp';

export const metadata: Metadata = {
  title: 'Refund and Cancellation Policy',
  description:
    'Learn about Tourillo Pvt Ltd’s refund and cancellation policy. Understand the terms, timelines, and conditions for cancelling your bookings and claiming refunds for tour packages and services.',
};

const page = () => {
  return <Rncp />;
};

export default page;
