'use client';

import React from 'react';
import LogoFull from './logo-full';
import { SidebarTrigger } from './ui/sidebar';
import ThemeChange from './theme-change';

const Navbar = () => {
  const showLogo = true;

  return (
    <nav
      className={`fixed z-10 top-0 left-0 right-0 h-14 border-b bg-foreground flex items-center px-3 ${
        showLogo ? 'justify-between' : 'justify-end'
      }`}
    >
      {showLogo && (
        <div className="flex items-center">
          <LogoFull />
        </div>
      )}
      <div className="flex w-fit items-center gap-5">
        <SidebarTrigger className="rounded-xs cursor-pointer bg-background" />
        <ThemeChange />
      </div>
    </nav>
  );
};

export default Navbar;
