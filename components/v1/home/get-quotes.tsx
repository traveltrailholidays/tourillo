'use client';

import Section from '../section';
import Container from '../container';
import GradientIcon from '../gradient-icon';
import QuoteForm from '../quotes/quote-form';
import { MdOutlineSupportAgent } from 'react-icons/md';
import { motion } from 'framer-motion';

const GetQuotes = () => {
  return (
    <Section className="bg-foreground py-20">
      <Container className="w-full flex justify-around items-center flex-wrap gap-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
          className="flex flex-col gap-2 items-center lg:mb-5 max-w-[650px] text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ 
              duration: 1, 
              delay: 0.2,
              type: 'spring',
              stiffness: 150
            }}
          >
            <GradientIcon icon={MdOutlineSupportAgent} size={100} />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text"
          >
            Our experts would love to help you plan your next trip!
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-1 font-semibold flex items-center"
          >
            Fill in your requirements here &gt;
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' as const }}
          className="w-full max-w-[650px] xl:max-w-[500px] bg-background rounded-xs"
        >
          <QuoteForm />
        </motion.div>
      </Container>
    </Section>
  );
};

export default GetQuotes;
