'use client';

import Section from '../section';
import Container from '../container';
import { useState } from 'react';
import QuoteModal from '../quotes/quote-modal';

const QuoteAction = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <Section className="py-20">
      <Container className="w-full flex flex-col items-center">
        <span className="mb-6 capitalize bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text w-fit text-2xl md:text-3xl font-bold text-center">
          Ready to Discover the World&apos;s Wonders?
        </span>
        <p className="font-medium text-sm md:text-base lg:text-lg max-w-5xl mb-10 opacity-90 leading-relaxed text-center w-full">
          Whether you&apos;re drawn to India&apos;s vibrant heritage or dreaming of adventures across the globe,
          we&apos;re here to design your perfect getaway. Let&apos;s turn your travel dreams into unforgettable
          journeys.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 px-5 py-2 text-lg rounded-xs cursor-pointer font-semibold text-white lg:flex items-center justify-center gap-2"
          >
            Get Quote
          </button>
        </div>
        <QuoteModal isOpen={isModalOpen} onClose={closeModal} />
      </Container>
    </Section>
  );
};

export default QuoteAction;
