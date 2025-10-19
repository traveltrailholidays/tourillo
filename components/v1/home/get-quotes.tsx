'use client';

import Section from '../section';
import Container from '../container';
import GradientIcon from '../gradient-icon';
import QuoteForm from '../quotes/quote-form';
import { MdOutlineSupportAgent } from 'react-icons/md';

const GetQuotes = () => {
  return (
    <Section className="bg-foreground py-20">
      <Container className="w-full flex justify-around items-center flex-wrap gap-10">
        <div className="flex flex-col gap-2 items-center lg:mb-5 max-w-[650px] text-center">
          <GradientIcon icon={MdOutlineSupportAgent} size={100} />
          <span className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Our experts would love to help you plan your next trip!
          </span>
          <span className="mt-1 font-semibold flex items-center">Fill in your requirements here &gt;</span>
        </div>

        <div className="w-full max-w-[650px] xl:max-w-[500px] bg-background rounded-xs">
          <QuoteForm />
        </div>
      </Container>
    </Section>
  );
};

export default GetQuotes;
