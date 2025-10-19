'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const ThemeSwitch = () => {
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
      className="w-full flex items-center gap-3 p-3 bg-background text-theme-text rounded-xl transition-all duration-200 hover:scale-[0.98] group cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/20"
    >
      <div className="p-2 bg-foreground rounded-lg group-hover:bg-violet-100 dark:group-hover:bg-violet-900/20 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
        {resolvedTheme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </div>
      <span className="font-medium">Toggle Theme</span>
    </button>
  );
};

export default ThemeSwitch;
