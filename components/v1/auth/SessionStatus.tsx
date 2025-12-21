'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SessionStatus() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.error) {
      console.warn('Session error detected:', session.error);

      // Redirect to login for various errors
      if (['user-not-found', 'user-inactive', 'database-error'].includes(session.error)) {
        router.push('/login');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 m-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Session Error</h3>
            <div className="mt-2 text-sm text-red-700">
              {session.error === 'user-not-found' && 'User account not found'}
              {session.error === 'user-inactive' && 'Account has been deactivated'}
              {session.error === 'database-error' && 'Database connection error'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
