'use client';

import React from 'react';
import IconLink from './icon-links';
import { GoHome, GoHomeFill } from 'react-icons/go';
import { IoIosHeart, IoIosHeartEmpty, IoIosSearch } from 'react-icons/io';

const FooterBar = () => {
  return (
    <div className="fixed bg-foreground bottom-0 w-full z-30 px-3 py-2 border-t lg:hidden flex justify-around">
      <IconLink activeIcon={GoHomeFill} icon={GoHome} href="/" text="Home" />
      <IconLink activeIcon={IoIosSearch} icon={IoIosSearch} href="/search" text="Search" />
      <IconLink activeIcon={IoIosHeart} icon={IoIosHeartEmpty} href="/wishlist" text="Wishlist" />
    </div>
  );
};

export default FooterBar;
