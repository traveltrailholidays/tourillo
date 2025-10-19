'use client';

import { useState } from 'react';
import Section from '../section';
import PageHero from '../page-hero';
import Container from '../container';
import { IoChevronBack, IoChevronForward, IoSearch } from 'react-icons/io5';

const Blogs = () => {
  const categories = ['All', 'Destinations', 'Travel Tips', 'Culture', 'Adventure', 'Food', 'Sustainability'];
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive categories per view
  const getCategoriesPerView = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 ? 4 : 2; // lg breakpoint
    }
    return 4; // default for SSR
  };

  const [categoriesPerView, setCategoriesPerView] = useState(getCategoriesPerView());

  // Update categories per view on window resize
  useState(() => {
    const handleResize = () => {
      setCategoriesPerView(getCategoriesPerView());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  });

  const maxIndex = Math.max(0, categories.length - categoriesPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleCategories = categories.slice(currentIndex, currentIndex + categoriesPerView);
  return (
    <main className="flex min-h-screen flex-col items-center justify-start min-w-screen overflow-x-hidden">
      <PageHero imageUrl="/images/blog/blog.webp" headingText="Tourillo Blogs" />
      <Section className="bg-slate-950">
        <Container className="w-full py-7 flex lg:items-center justify-between flex-col lg:flex-row gap-10">
          {/* Search Bar */}
          <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
            <div className="relative w-full lg:max-w-md flex items-center group">
              <IoSearch
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10"
              />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 text-base lg:text-lg bg-white text-gray-900 rounded-l-xs focus:outline-none transition-all duration-200 placeholder:text-gray-500 font-medium border-r-0 h-10"
              />
              <div className="flex items-center justify-center text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 rounded-r-xs hover:shadow-lg transition-all duration-200 cursor-pointer h-10 min-w-[48px]">
                <IoSearch size={20} className="lg:w-6 lg:h-6" />
              </div>
            </div>

            {/* Category Carousel */}
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto">
              {/* Left Arrow */}
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`flex items-center justify-center w-10 lg:w-12 h-10 lg:h-10 rounded-xs transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  currentIndex === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-purple-500/25'
                }`}
              >
                <IoChevronBack size={18} />
              </button>

              {/* Categories Container */}
              <div className="flex-1 lg:flex-none overflow-hidden">
                <div className="flex gap-2 transition-transform duration-300 ease-in-out">
                  {visibleCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium rounded-xs cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 whitespace-nowrap flex-shrink-0 h-10 lg:h-10 min-w-[80px] lg:min-w-[100px] flex items-center justify-center ${
                        category === activeCategory
                          ? 'text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-purple-500/25'
                          : 'bg-gray-700 text-gray-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:text-white hover:shadow-purple-500/25'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Arrow */}
              <button
                onClick={goToNext}
                disabled={currentIndex >= maxIndex}
                className={`flex items-center justify-center w-10 lg:w-12 h-10 lg:h-10 rounded-xs transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  currentIndex >= maxIndex
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-purple-500/25'
                }`}
              >
                <IoChevronForward size={18} />
              </button>
            </div>
          </div>

          {/* Pagination Dots (Optional - for better UX) */}
          {maxIndex > 0 && (
            <div className="flex justify-center mt-4 gap-2 lg:hidden">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>
      <Section className="py-10 sm:py-12 md:py-16 lg:py-20">
        <Container className="w-full">
          <div className="">hello</div>
        </Container>
      </Section>
    </main>
  );
};

export default Blogs;
