import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavbarMarginLayout from '@/components/v1/navbar/navbar-margin-layout';
import Section from '@/components/v1/section';
import Container from '@/components/v1/container';
import Footer from '@/components/v1/footer/footer';
import FooterBar from '@/components/v1/footer/footer-bar';

const NotFound = () => {
  return (
    <NavbarMarginLayout>
      <main className="flex flex-col items-center justify-start w-full overflow-x-hidden">
        <Section className="py-14 sm:py-16 md:py-20 lg:py-24">
          <Container className="w-full flex flex-col justify-center items-center">
            <Image
              src={`/images/not-found/not-found.webp`}
              alt=""
              width={1000}
              height={1000}
              className="w-[350px] h-full"
              priority
            />
            <div className="flex flex-col gap-1 text-center mt-5">
              <span className="text-3xl font-bold">Oops!!! Page not found!</span>
              <span className="text-xl">We can&apos;t seem to find the page you&apos;re looking for.</span>
            </div>
            <div className="mt-5 flex flex-col gap-3 justify-center items-center text-center">
              <span>Here are some helpful links instead:</span>
              <div className="flex flex-wrap gap-5 justify-center items-center">
                <Link
                  href="/"
                  className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 rounded text-white py-2 px-3 font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/packages"
                  className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 rounded text-white py-2 px-3 font-medium"
                >
                  Packages
                </Link>
                <Link
                  href="/blogs"
                  className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 rounded text-white py-2 px-3 font-medium"
                >
                  Blogs
                </Link>
                <Link
                  href="/about-us"
                  className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 rounded text-white py-2 px-3 font-medium"
                >
                  About Us
                </Link>
                <Link
                  href="/contact-us"
                  className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 rounded text-white py-2 px-3 font-medium"
                >
                  Contact Us
                </Link>
                <Link
                  href="/payments"
                  className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 rounded text-white py-2 px-3 font-medium"
                >
                  Payments
                </Link>
              </div>
            </div>
          </Container>
        </Section>
        <FooterBar />
        <Footer />
      </main>
    </NavbarMarginLayout>
  );
};

export default NotFound;
