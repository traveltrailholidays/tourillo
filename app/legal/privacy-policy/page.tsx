import type { Metadata } from 'next';
import Privacy from '@/components/v1/legal/privacy-policy';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'Read the privacy policy of Tourillo Pvt Ltd to understand how we collect, use, protect, and handle your personal information. We are committed to ensuring your data is secure and your privacy is respected throughout your travel planning journey.',
};

const page = () => {
  return <Privacy />;
};

export default page;
