import ListingForm from '@/components/listing-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Package',
  description:
    'Create new travel packages within the Tourillo admin panel. Add package details, pricing, destinations, and itineraries to efficiently manage and expand your platform’s offerings.',
};

const page = () => {
  return <ListingForm />;
};

export default page;
