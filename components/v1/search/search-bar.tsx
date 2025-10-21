'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBarProps {
  initialQuery?: string;
}

export default function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce the query with 500ms delay
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialQuery && debouncedQuery.trim()) {
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
      setTimeout(() => setIsSearching(false), 300);
    } else if (debouncedQuery === '' && pathname === '/search') {
      router.push('/search');
    }
  }, [debouncedQuery, router, pathname, initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative ">
      <div className="relative group">
        {isSearching ? (
          <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500 dark:text-purple-400 animate-spin" />
        ) : (
          <Search
            className={`absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
              isFocused ? 'text-purple-500 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        )}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search"
          className="w-full pl-12 pr-6 py-2 text-lg rounded-none border-b-2 focus:outline-none transition"
        />
      </div>
    </form>
  );
}
