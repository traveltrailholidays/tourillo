import { Metadata } from 'next';
import TermsCondition from '@/components/v1/legal/tnc';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Review the terms and conditions of using services provided by Tourillo Pvt Ltd. Understand your rights, responsibilities, and the rules governing bookings, payments, and travel services.',
};

const page = () => {
  return <TermsCondition />;
};

export default page;
