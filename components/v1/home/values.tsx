'use client';

import DATA from '@/lib/data';
import Container from '../container';
import Section from '../section';
import SectionHeading from '../section-heading';
import GradientIcon from '../gradient-icon';
import { motion, Variants } from 'framer-motion';

const Values = () => {
  // Container animation for staggering children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Individual card animation
  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const, // Type assertion for ease
      },
    },
  };

  return (
    <Section className="bg-background py-20">
      <Container className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading mainHeading="What We Serve" subHeading="Top Values For You !" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10 flex flex-wrap md:flex-nowrap gap-5 justify-center items-stretch"
        >
          {DATA.homeValues.map((value, index) => (
            <motion.div key={index} variants={cardVariants} className="flex flex-col pt-10 relative w-full md:w-4/12">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2 + 0.3,
                  type: 'spring',
                  stiffness: 200,
                }}
                className="w-20 h-20 absolute top-0 bg-background left-6 flex justify-center items-center rounded-full"
              >
                <GradientIcon icon={value.icon} size={48} />
              </motion.div>

              <div className="bg-purple-500/[0.05] dark:bg-purple-500/[0.2] pt-16 px-6 pb-6 flex flex-col w-full gap-4 rounded rounded-tl-none flex-grow">
                <h5 className="text-3xl font-medium">{value.title}</h5>
                <p className="text-lg text-muted-foreground">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default Values;
