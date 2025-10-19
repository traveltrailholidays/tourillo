import { QuoteList } from '@/components/admin/quote-list';
import { getAllQuotes, getUnreadQuoteCount } from '@/lib/actions/quote-actions';
import { BadgePercent } from 'lucide-react';

const page = async () => {
  const quotes = await getAllQuotes();
  const unreadCount = await getUnreadQuoteCount();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quote Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer quote requests and inquiries
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
          <BadgePercent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {unreadCount} Unread
          </span>
        </div>
      </div>
      <QuoteList quotes={quotes} />
    </div>
  );
};

export default page;
