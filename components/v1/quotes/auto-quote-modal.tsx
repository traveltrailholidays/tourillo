'use client';

import { useAutoModal } from '@/hooks/use-auto-modal';
import QuoteModal from './quote-modal';

interface AutoQuoteModalProps {
  delay?: number; // Delay in milliseconds (default: 10 seconds)
}

export function AutoQuoteModal({ delay = 10000 }: AutoQuoteModalProps) {
  const { isModalOpen, closeModal } = useAutoModal({ delay });

  return <QuoteModal isOpen={isModalOpen} onClose={closeModal} />;
}
