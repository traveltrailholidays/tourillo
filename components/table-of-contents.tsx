'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, List } from 'lucide-react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <div className="bg-foreground rounded-lg p-6">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center justify-between w-full text-left mb-4 font-semibold"
      >
        <span className="flex items-center">
          <List className="h-4 w-4 mr-2" />
          Table of Contents
        </span>
        <ChevronRight className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {/* Desktop Title */}
      <h3 className="hidden lg:block font-semibold mb-4 flex items-center">
        <List className="h-4 w-4 mr-2" />
        Table of Contents
      </h3>
      
      {/* TOC List */}
      <nav className={`${isOpen ? 'block' : 'hidden lg:block'}`}>
        <ul className="space-y-2">
          {headings.map(({ id, text, level }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                className={`block w-full text-left text-sm transition-colors hover:text-purple-600 ${
                  activeId === id
                    ? 'text-purple-600 font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                style={{ paddingLeft: `${(level - 1) * 16}px` }}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
