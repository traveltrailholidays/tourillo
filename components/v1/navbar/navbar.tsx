import React from 'react';
import UpperNavbar from './upper-navbars';
import LowerNavbar from './lower-navbar';

const Navbar = () => {
  return (
    <div className="w-full fixed z-40 top-0">
      <UpperNavbar className="" />
      <LowerNavbar />
    </div>
  );
};

export default Navbar;
