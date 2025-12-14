import type { Metadata } from 'next';

import { ItineraryList } from '@/components/admin/itinerary-list';
import { getAllItineraries } from '@/lib/actions/itinerary-actions';

export const metadata: Metadata = {
  title: 'Itinerary List',
  description:
    'View and manage all travel itineraries in the Tourillo admin panel. Access details, schedules, destinations, and activities to efficiently oversee and update your platform’s travel plans.',
};

export default async function ItineraryListPage() {
  const itineraries = await getAllItineraries();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 ">All Itinerary</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all travel itineraries</p>
        </div>
      </div>

      <ItineraryList itineraries={itineraries} />
    </div>
  );
}
