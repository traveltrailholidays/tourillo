'use client';

import DATA from '@/lib/data';
import { useState } from 'react';
import Section from '../section';
import Container from '../container';
import { IoMdClose } from 'react-icons/io';

interface UpperNavbarProps {
  className?: string;
}

const UpperNavbar: React.FC<UpperNavbarProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true);
  const data = DATA.uNav;

  if (!data.message || !isVisible) {
    return null;
  }

  return (
    <Section
      id="upper-navbar"
      className={`${className} bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-1 relative transition-all duration-300`}
    >
      <Container className="text-center">
        <span className="text-sm font-semibold">{data.message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition cursor-pointer"
          aria-label="Close notification"
        >
          <IoMdClose size={18} strokeWidth={20} />
        </button>
      </Container>
    </Section>
  );
};

export default UpperNavbar;
