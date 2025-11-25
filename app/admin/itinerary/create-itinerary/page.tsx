import CreateItinerary from '@/components/admin/create-itinerary';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Itinerary',
  description:
    'Easily create new travel itineraries in the Tourillo admin panel. Add destinations, schedules, activities, and other details to design seamless journeys for your travelers.',
};

const page = () => {
  return <CreateItinerary />;
};

export default page;
