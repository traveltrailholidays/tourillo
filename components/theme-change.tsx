'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const ThemeChange = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle theme"
      className="w-full flex items-center gap-3 p-2 bg-background text-theme-text rounded transition-all duration-200 hover:scale-[0.98] cursor-pointer"
    >
      {resolvedTheme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeChange;
