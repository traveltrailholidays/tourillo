// app/page.tsx
import Footer from '@/components/v1/footer/footer';
import FooterBar from '@/components/v1/footer/footer-bar';
import Faqs from '@/components/v1/home/faq';
import FeaturedTrips from '@/components/v1/home/featured-trips';
import GetQuotes from '@/components/v1/home/get-quotes';
import Hero from '@/components/v1/home/hero';
import HomeStats from '@/components/v1/home/home-stats';
import QuoteAction from '@/components/v1/home/quote-action';
import SelectTheme from '@/components/v1/home/select-theme';
import Testimonials from '@/components/v1/home/testimonials';
import Values from '@/components/v1/home/values';
import WeekendTrips from '@/components/v1/home/weekend-trips';
import NavbarMarginLayout from '@/components/v1/navbar/navbar-margin-layout';
import { getDisplayedReviews } from '@/lib/actions/review-actions';

// Type definition for formatted review
interface FormattedReview {
  id: string;
  name: string;
  review: string;
  rating: number;
  image: string;
  reviewDate: string;
}

const Page = async () => {
  let reviews: FormattedReview[] = [];

  try {
    const reviewsData = await getDisplayedReviews();

    // Format dates
    reviews = reviewsData.map((review) => ({
      id: review.id,
      name: review.name,
      review: review.review,
      rating: review.rating,
      image: review.image,
      reviewDate: new Date(review.reviewDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    }));

    console.log('Reviews loaded:', reviews.length);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }

  return (
    <NavbarMarginLayout>
      <div className="overflow-hidden">
        <Hero />
      </div>
      <main className="flex flex-col items-center justify-start w-full overflow-x-hidden">
        <SelectTheme />
        <FeaturedTrips />
        <WeekendTrips />
        <Values />
        <GetQuotes />
        <Testimonials reviews={reviews} />
        <HomeStats />
        <Faqs />
        <QuoteAction />
        <FooterBar />
        <Footer />
      </main>
    </NavbarMarginLayout>
  );
};

export default Page;
