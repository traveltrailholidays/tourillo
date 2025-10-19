import Footer from '@/components/v1/footer/footer';
import FooterBar from '@/components/v1/footer/footer-bar';
import Faqs from '@/components/v1/home/faq';
import HomeStats from '@/components/v1/home/home-stats';
import QuoteAction from '@/components/v1/home/quote-action';
import NavbarMarginLayout from '@/components/v1/navbar/navbar-margin-layout';

interface NavlinksLayoutProps {
  children: React.ReactNode;
}

const NavlinksLayout: React.FC<NavlinksLayoutProps> = ({ children }) => {
  return (
    <NavbarMarginLayout>
      <main className="flex flex-col items-center justify-start w-full overflow-x-hidden">
        {children}
        <HomeStats />
        <Faqs />
        <QuoteAction />
        <FooterBar />
        <Footer />
      </main>
    </NavbarMarginLayout>
  );
};

export default NavlinksLayout;
