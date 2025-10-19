'use client';

import { useState, useEffect } from 'react';

interface UseAutoModalOptions {
  delay?: number; // Delay in milliseconds (default: 10000 = 10 seconds)
  sessionKey?: string; // Key for sessionStorage (default: 'autoModalShown')
}

export function useAutoModal(options: UseAutoModalOptions = {}) {
  const { delay = 10000, sessionKey = 'autoModalShown' } = options;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;

    // Check if modal has already been shown in this session
    const hasBeenShown = sessionStorage.getItem(sessionKey);

    if (hasBeenShown) {
      return; // Don't show modal if it's already been shown in this session
    }

    // Set timer to show modal after delay
    const timer = setTimeout(() => {
      setIsModalOpen(true);
      // Mark as shown in this session
      sessionStorage.setItem(sessionKey, 'true');
    }, delay);

    // Cleanup timer if component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [delay, sessionKey]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
    // Mark as shown when manually opened
    sessionStorage.setItem(sessionKey, 'true');
  };

  return {
    isModalOpen,
    closeModal,
    openModal,
  };
}
