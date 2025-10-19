import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/about', '/contact', '/pricing', '/features', '/blog', '/terms', '/privacy'];

// Define auth-related routes
const authRoutes = ['/login', '/register', '/auth/signin', '/auth/signup', '/auth/error', '/auth/verify-request'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/account'];

// Define admin-only routes
const adminRoutes = ['/das'];

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  events: {
    async signOut(message) {
      if ('token' in message && message.token?.sub) {
        try {
          await prisma.session.deleteMany({
            where: { userId: message.token.sub },
          });
          console.log(`Sessions cleaned up for user: ${message.token.sub}`);
        } catch (error) {
          console.error('Error cleaning up sessions:', error);
        }
      }
    },
    async signIn(message) {
      if (message.user?.id && message.user?.email) {
        console.log(`User ${message.user.email} signed in with ${message.account?.provider}`);

        try {
          await prisma.user.update({
            where: { id: message.user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch (error) {
          console.error('Error updating last login:', error);
        }
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow OAuth providers to create new users
      if (account?.provider === 'google') {
        // For OAuth, user.id might not be set for new users
        // We need to check by email instead
        if (user.email) {
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: {
                id: true,
                isActive: true,
                email: true,
              },
            });

            // If user exists, check if they're active
            if (existingUser) {
              if (!existingUser.isActive) {
                console.warn(`Sign in blocked - user deactivated: ${user.email}`);
                return false;
              }
              console.log(`Existing user signing in: ${user.email}`);
              return true;
            }

            // If user doesn't exist, allow them to sign up (Auth.js will create the user)
            console.log(`New user signing up: ${user.email}`);
            return true;
          } catch (error) {
            console.error('Error during sign in validation:', error);
            return false;
          }
        }
      }

      // For other providers or if no email, allow by default
      return true;
    },

    async session({ session, user }) {
      if (!user?.id) {
        return {
          ...session,
          error: 'user-not-found' as const,
        };
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            isAdmin: true,
            isAgent: true,
            isActive: true,
            wishlistId: true, // Add wishlist
          },
        });

        if (!dbUser) {
          console.warn(`Session invalidated - user not found: ${user.id}`);
          return {
            ...session,
            error: 'user-not-found' as const,
          };
        }

        if (!dbUser.isActive) {
          console.warn(`Session invalidated - user inactive: ${user.id}`);
          return {
            ...session,
            error: 'user-inactive' as const,
          };
        }

        return {
          ...session,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
            isAdmin: Boolean(dbUser.isAdmin),
            isAgent: Boolean(dbUser.isAgent),
            wishlistId: dbUser.wishlistId, // Include wishlist
          },
        };
      } catch (error) {
        console.error('Database error during session callback:', error);
        return {
          ...session,
          error: 'database-error' as const,
        };
      }
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user && !auth?.error;
      const { pathname } = nextUrl;

      // Helper function to check if path matches any route pattern
      const matchesRoute = (routes: string[], path: string) => {
        return routes.some((route) => {
          if (route.endsWith('*')) {
            return path.startsWith(route.slice(0, -1));
          }
          return path === route || path.startsWith(route + '/');
        });
      };

      // Allow all auth routes (login, register, etc.)
      if (matchesRoute(authRoutes, pathname)) {
        // Redirect logged-in users away from auth pages
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // Allow all public routes without authentication
      if (matchesRoute(publicRoutes, pathname)) {
        return true;
      }

      // Check admin routes
      if (matchesRoute(adminRoutes, pathname)) {
        if (!isLoggedIn) {
          const loginUrl = new URL('/login', nextUrl);
          loginUrl.searchParams.set('callbackUrl', pathname);
          return Response.redirect(loginUrl);
        }
        if (!auth?.user?.isAdmin) {
          console.log(auth);
          // return Response.redirect(new URL('/', nextUrl))
        }
        return true;
      }

      // Check protected routes
      if (matchesRoute(protectedRoutes, pathname)) {
        if (!isLoggedIn) {
          const loginUrl = new URL('/login', nextUrl);
          loginUrl.searchParams.set('callbackUrl', pathname);
          return Response.redirect(loginUrl);
        }
        return true;
      }

      // For any other routes not explicitly defined, allow access
      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
