'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface ActiveLinkProps {
  href: string;
  text: string;
  className?: string;
  onClick?: () => void;
}

const ActiveLink: React.FC<ActiveLinkProps> = ({ href, text, className, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
                ${isActive ? 'text-violet-600 dark:text-violet-400' : 'hover:text-violet-600 dark:hover:text-violet-400'}
                ${className}
            `}
      onClick={onClick}
    >
      {text}
    </Link>
  );
};

export default ActiveLink;
