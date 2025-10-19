import { ItineraryList } from '@/components/admin/itinerary-list';
import { getAllItineraries } from '@/lib/actions/itinerary-actions';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ItineraryListPage() {
  const itineraries = await getAllItineraries();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Itinerary Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all travel itineraries
          </p>
        </div>
        <Link href="/admin/itinerary/create-itinerary">
          <Button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <Plus className="h-4 w-4" />
            Create Itinerary
          </Button>
        </Link>
        
      </div>

      <ItineraryList itineraries={itineraries} />
    </div>
  );
}
