'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const NavSearch = () => {
  const router = useRouter();

  const handleSearchClick = () => {
    router.push('/search');
  };

  return (
    <button
      onClick={handleSearchClick}
      aria-label="Search"
      className="p-2 rounded transition-colors duration-200 ease-in-out cursor-pointer hover:bg-background hidden lg:block"
    >
      <Search className="h-5 w-5" />
    </button>
  );
};

export default NavSearch;
