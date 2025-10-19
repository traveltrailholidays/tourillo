'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast'; // or your preferred toast library

export function useAuthValidation() {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    if (session?.error) {
      const errorMessages = {
        'user-not-found': 'Your account has been deleted. Please contact support if this is an error.',
        'database-error': 'There was a problem with your account. Please try signing in again.',
        'user-inactive': 'Your account has been deactivated. Please contact support.',
      };

      const message = errorMessages[session.error] || 'Authentication error occurred.';

      console.warn(`Session error: ${session.error}`);
      toast.error(message);

      // Sign out user after showing error
      signOut({
        callbackUrl: '/login',
        redirect: true,
      });
    }
  }, [session?.error]);

  // Function to manually refresh session (useful after account updates)
  const refreshSession = async () => {
    await update();
  };

  return {
    session: session?.error ? null : session,
    status: session?.error ? 'unauthenticated' : status,
    refreshSession,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user && !session?.error,
  };
}
