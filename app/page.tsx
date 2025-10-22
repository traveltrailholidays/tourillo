import Footer from '@/components/v1/footer/footer';
import FooterBar from '@/components/v1/footer/footer-bar';
import Faqs from '@/components/v1/home/faq';
import FeaturedTrips from '@/components/v1/home/featured-trips';
import GetQuotes from '@/components/v1/home/get-quotes';
import Hero from '@/components/v1/home/hero';
import HomeStats from '@/components/v1/home/home-stats';
// import OfferImage from '@/components/v1/home/offer-image';
import QuoteAction from '@/components/v1/home/quote-action';
import SelectTheme from '@/components/v1/home/select-theme';
import Testimonials from '@/components/v1/home/testimonials';
import Values from '@/components/v1/home/values';
import WeekendTrips from '@/components/v1/home/weekend-trips';
import NavbarMarginLayout from '@/components/v1/navbar/navbar-margin-layout';

const page = async () => {
  return (
    <NavbarMarginLayout>
      <div className="overflow-hidden">
        <Hero />
      </div>
      <main className="flex flex-col items-center justify-start w-full overflow-x-hidden">
        <SelectTheme />
        <FeaturedTrips />
        {/* <OfferImage /> */}
        <WeekendTrips />
        <Values />
        <GetQuotes />
        <Testimonials />
        <HomeStats />
        <Faqs />
        <QuoteAction />
        <FooterBar />
        <Footer />
      </main>
    </NavbarMarginLayout>
  );
};

export default page;
