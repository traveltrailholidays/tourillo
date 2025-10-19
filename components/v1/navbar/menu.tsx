'use client';

import SideBar from './sidebar';

import { useState } from 'react';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="">
      <button
        onClick={toggleMenu}
        className="lg:hidden flex items-center justify-center hover:bg-background cursor-pointer rounded transition-colors"
        aria-label="Toggle menu"
      >
        <HiOutlineMenuAlt3 className="h-[22px] w-[22px] lg:h-auto lg:w-auto" />
      </button>

      <button
        onClick={toggleMenu}
        className="bg-gradient-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 px-2 py-[7px] text-sm rounded-xs cursor-pointer font-semibold text-white lg:flex items-center justify-center gap-2 hidden"
        aria-label="Toggle menu"
      >
        <HiOutlineMenuAlt3 className="h-4 w-4" />
        Menu
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={toggleMenu} />}

      <SideBar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default Menu;
