'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  mainHeading?: string;
  subHeading?: string;
  isSmallS?: boolean;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ mainHeading, subHeading, isSmallS }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex gap-2">
      <motion.div
        initial={{ scaleY: 0 }}
        animate={isMounted ? { scaleY: 1 } : { scaleY: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 w-2 origin-top"
      />
      <div className="overflow-hidden">
        <motion.h1
          initial={{ x: -100, opacity: 0 }}
          animate={isMounted ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="capitalize bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text text-2xl md:text-3xl font-bold"
        >
          {mainHeading}
          {isSmallS && <span className="text-xl">S</span>}
        </motion.h1>
        <motion.h1
          initial={{ x: -80, opacity: 0 }}
          animate={isMounted ? { x: 0, opacity: 1 } : { x: -80, opacity: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm md:text-base lg:text-lg font-medium"
        >
          {subHeading}
        </motion.h1>
      </div>
    </div>
  );
};

export default SectionHeading;
