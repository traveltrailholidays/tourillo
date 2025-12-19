// app/admin/review/edit/[reviewId]/page.tsx
import { getReviewById } from '@/lib/actions/review-actions';
import { notFound } from 'next/navigation';
import EditReviewForm from '@/components/admin/edit-review-form';

interface PageProps {
  params: Promise<{
    reviewId: string;
  }>;
}

export default async function EditReviewPage({ params }: PageProps) {
  const { reviewId } = await params;

  try {
    const review = await getReviewById(reviewId);

    if (!review) {
      notFound();
    }

    return (
      <div className="w-full mx-auto p-6">
        <EditReviewForm review={review} />
      </div>
    );
  } catch (error) {
    console.error('Error loading review:', error);
    notFound();
  }
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { reviewId } = await params;

  try {
    const review = await getReviewById(reviewId);

    return {
      title: `Edit Review - ${review?.name || 'Unknown'}`,
      description: `Edit review from ${review?.name || 'customer'}`,
    };
  } catch (error) {
    return {
      title: 'Edit Review',
      description: 'Edit customer review',
    };
  }
}
