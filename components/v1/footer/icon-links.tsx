'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { IconType } from 'react-icons';

interface IconLinkProps {
  icon: IconType;
  activeIcon: IconType;
  href: string;
  text?: string;
}

const IconLink: React.FC<IconLinkProps> = ({ icon: Icon, activeIcon: ActiveIcon, href, text }) => {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
  const gradientId = React.useId();

  return (
    <Link href={href} className="flex flex-col justify-center items-center group">
      {isActive ? (
        <>
          <ActiveIcon size={26} style={{ fill: `url(#${gradientId})` }} className="transition-colors duration-200" />
          <svg width="0" height="0" className="absolute">
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </svg>
        </>
      ) : (
        <Icon size={26} className="text-[#a3a3a3] group-hover:text-indigo-500 transition-colors duration-200" />
      )}
      <p
        className={`text-[10px] transition-colors duration-200 ${
          isActive
            ? 'text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 font-semibold'
            : 'text-[#a3a3a3] group-hover:text-indigo-500'
        }`}
      >
        {text}
      </p>
    </Link>
  );
};

export default IconLink;
