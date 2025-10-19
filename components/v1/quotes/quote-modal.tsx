'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MdOutlineSupportAgent } from 'react-icons/md';
import GradientIcon from '../gradient-icon';
import QuoteForm from './quote-form';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuoteModal = ({ isOpen, onClose }: QuoteModalProps) => {
  const [mounted, setMounted] = useState(false);

  // Handle mounting on client side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!mounted) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 dark:bg-white/20 backdrop-blur-[3px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-fit bg-foreground rounded shadow-xs my-8">
        {/* Close button */}
        <div className="w-full flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Modal content */}
        <div className="pt-2 md:pt-2 p-6 md:p-8 pb-8">
          <div className="flex flex-col gap-6 items-center justify-center w-full">
            <div className="flex flex-col gap-2 items-center text-center">
              <GradientIcon icon={MdOutlineSupportAgent} size={80} />
              <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                Get a Custom Travel Quote
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xl">
                Our experts would love to help you plan your next trip! Fill in your requirements and we&apos;ll get
                back to you.
              </p>
            </div>
            <QuoteForm onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
