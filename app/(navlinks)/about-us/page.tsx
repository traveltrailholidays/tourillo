import { Metadata } from 'next';
import AboutUs from '@/components/v1/about-us/about-us';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Discover India with Tourillo Pvt Ltd — your trusted partner for personalized tour packages. We create seamless, secure, and memorable travel experiences tailored to your journey.',
};

const page = () => {
  return <AboutUs />;
};

export default page;
