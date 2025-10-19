import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  isAgent: boolean;
  wishlistId: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  addToWishlist: (listingId: string) => void;
  removeFromWishlist: (listingId: string) => void;
  isInWishlist: (listingId: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      addToWishlist: (listingId) =>
        set((state) => {
          if (!state.user) return state;
          const wishlistId = [...new Set([...state.user.wishlistId, listingId])];
          return {
            user: {
              ...state.user,
              wishlistId,
            },
          };
        }),

      removeFromWishlist: (listingId) =>
        set((state) => {
          if (!state.user) return state;
          const wishlistId = state.user.wishlistId.filter((id) => id !== listingId);
          return {
            user: {
              ...state.user,
              wishlistId,
            },
          };
        }),

      isInWishlist: (listingId) => {
        const user = get().user;
        return user?.wishlistId.includes(listingId) || false;
      },
    }),
    {
      name: 'tourillo-auth-storage',
    }
  )
);
