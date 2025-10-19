'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setUser, clearUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user && !session.error) {
      // User is authenticated, store in Zustand
      setUser({
        id: session.user.id!,
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        isAdmin: session.user.isAdmin || false,
        isAgent: session.user.isAgent || false,
        wishlistId: session.user.wishlistId || [],
      });
    } else if (session?.error) {
      // Session has error (user deleted, inactive, etc.)
      clearUser();
      router.push('/login');
    } else {
      // No session
      clearUser();
    }
  }, [session, status, setUser, clearUser, router]);

  return <>{children}</>;
}
