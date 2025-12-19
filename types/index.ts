import { Listing, User } from '@prisma/client';

// ✅ SafeListing type with string dates (for serialization)
export type SafeListing = Omit<Listing, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type safeUser = Omit<User, 'createdAt' | 'updatedAt' | 'emailVerified'> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};
