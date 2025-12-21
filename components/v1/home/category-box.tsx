'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import { IconType } from 'react-icons';
import qs from 'query-string';
import Link from 'next/link';

interface CategoryBoxProps {
  icon: IconType;
  label: string;
  selected?: boolean;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({ icon: Icon, label, selected }) => {
  const params = useSearchParams();

  const handleClick = React.useCallback(() => {
    const currentQuery = params ? qs.parse(params.toString()) : {};

    const updatedQuery: Record<string, string | undefined> = {
      ...currentQuery,
      category: params?.get('category') === label ? undefined : label,
    };

    // Remove undefined values
    Object.keys(updatedQuery).forEach((key) => updatedQuery[key] === undefined && delete updatedQuery[key]);

    return qs.stringifyUrl(
      {
        url: '/packages',
        query: updatedQuery,
      },
      { skipNull: true }
    );
  }, [label, params]);

  return (
    <Link
      href={handleClick()}
      className={`
        group relative overflow-hidden
        flex flex-col items-center justify-center gap-3 
        py-4 px-6 sm:py-6 sm:px-8 md:px-10 
        rounded cursor-pointer 
        min-h-[120px] sm:min-h-[140px] w-full
        transition-all duration-300 ease-in-out
        transform hover:scale-105
        ${
          selected
            ? 'bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold'
            : 'bg-foreground hover:bg-linear-to-br hover:from-indigo-500/10 hover:via-purple-500/10 hover:to-pink-500/10'
        }
      `}
    >
      {/* Gradient overlay for hover effect */}
      <div
        className={`
        absolute inset-0 bg-linear-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 
        transition-all duration-300 ease-in-out rounded
        ${!selected ? 'group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5' : ''}
      `}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div
          className={`
          transition-all duration-300 ease-in-out transform group-hover:scale-110
        `}
        >
          <Icon size={28} className="sm:w-8 sm:h-8" />
        </div>
        <div
          className={`
          font-medium text-sm sm:text-base text-center transition-all duration-300
        `}
        >
          {label}
        </div>
      </div>
    </Link>
  );
};

export default CategoryBox;
