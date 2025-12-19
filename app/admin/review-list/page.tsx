import { getAllReviewsForTable } from '@/lib/actions/review-actions';
import { ReviewList } from '@/components/admin/review-list';

export default async function AdminReviewsPage() {
  const reviews = await getAllReviewsForTable();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage customer reviews and testimonials</p>
      </div>
      <ReviewList reviews={reviews} />
    </div>
  );
}
