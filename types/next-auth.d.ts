import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      isAgent?: boolean;
      wishlistId?: string[];
    };
    error?: 'user-not-found' | 'user-inactive' | 'database-error';
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin?: boolean;
    isAgent?: boolean;
    wishlistId?: string[];
  }
}
