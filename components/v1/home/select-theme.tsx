'use client';

import React, { useRef } from 'react';
import Section from '../section';
import Container from '../container';
import SectionHeading from '../section-heading';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { usePathname, useSearchParams } from 'next/navigation';
import { categories } from '@/data/categories';
import CategoryBox from './category-box';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SelectTheme = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params?.get('category');
  const isMainPage = pathname === '/';

  if (!isMainPage) {
    return null;
  }

  return (
    <Section className="py-8 sm:py-12 md:py-16 lg:py-20">
      <Container className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="flex w-full justify-between items-start sm:items-center flex-col sm:flex-row gap-4 sm:gap-0"
        >
          <SectionHeading mainHeading="Select Theme" subHeading="Browse Packages Through THEMES" />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-2 sm:gap-4 self-end sm:self-auto"
          >
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="group relative p-2 sm:p-3 transition-all duration-300 bg-linear-to-r from-purple-500/60 to-indigo-500/60 dark:from-purple-500/30 dark:to-indigo-500/30 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:from-purple-600/80 hover:to-indigo-600/80 dark:hover:from-purple-500/50 dark:hover:to-indigo-500/50 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiChevronLeft size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="group relative p-2 sm:p-3 transition-all duration-300 bg-linear-to-r from-purple-500/60 to-indigo-500/60 dark:from-purple-500/30 dark:to-indigo-500/30 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:from-purple-600/80 hover:to-indigo-600/80 dark:hover:from-purple-500/50 dark:hover:to-indigo-500/50 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiChevronRight size={20} strokeWidth={3} className="sm:w-6 sm:h-6" />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-10"
        >
          <Swiper
            breakpoints={{
              320: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              460: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              640: {
                slidesPerView: 4,
                spaceBetween: 28,
              },
              900: {
                slidesPerView: 5,
                spaceBetween: 32,
              },
              1300: {
                slidesPerView: 6,
                spaceBetween: 32,
              },
            }}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Navigation]}
            className=""
            watchOverflow={true}
            centerInsufficientSlides={true}
          >
            {categories.map((item, index) => (
              <SwiperSlide key={index} className="!h-auto">
                <CategoryBox key={item.label} label={item.label} icon={item.icon} selected={category === item.label} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </Container>
    </Section>
  );
};

export default SelectTheme;
