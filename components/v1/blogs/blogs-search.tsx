'use client';

import { useState } from 'react';
import { IoSearch } from 'react-icons/io5';

const BlogsSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
      <div className="relative w-full lg:max-w-md flex items-center group">
        <IoSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 pr-4 text-base lg:text-lg bg-white text-gray-900 rounded-l-xs focus:outline-none transition-all duration-200 placeholder:text-gray-500 font-medium border-r-0 h-10"
        />
        <div className="flex items-center justify-center text-white bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 rounded-r-xs hover:shadow-lg transition-all duration-200 cursor-pointer h-10 min-w-[48px]">
          <IoSearch size={20} className="lg:w-6 lg:h-6" />
        </div>
      </div>

      {/* Blog Filters */}
    </div>
  );
};

export default BlogsSearch;
