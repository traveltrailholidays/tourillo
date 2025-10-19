import { ReactNode } from 'react';

export interface AuthState {
  token: string | null;
  role: number;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  login: (token: string) => void;
  logout: () => void;
  authenticateToken: () => Promise<boolean>;
  initializeAuth: () => Promise<boolean>;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  fallback: ReactNode;
}
