import { Metadata } from 'next';
import ContactUs from '@/components/v1/contact-us/contact-us';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Tourillo Pvt Ltd for personalized travel assistance, tour bookings, and customer support. We’re here to help you plan your perfect India getaway with ease.',
};

const page = () => {
  return <ContactUs />;
};

export default page;
