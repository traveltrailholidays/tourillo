'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function AdminOnlyWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to check auth state
    const timer = setTimeout(() => {
      // Check if user is logged in
      if (!isAuthenticated || !user) {
        router.replace('/');
        return;
      }

      // Check if user is ADMIN (not agent)
      if (!user.isAdmin) {
        // Redirect agents and regular users to dashboard
        router.replace('/admin/dashboard');
        return;
      }

      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading state while checking
  if (isChecking) {
    return null;
  }

  // Don't render if not admin
  if (!isAuthenticated || !user || !user.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
