// Export auth configuration and helpers
export { authOptions, auth, getServerSession } from './auth';

// Export types from next-auth.d.ts
export type { AuthOptions, Account, Profile } from './next-auth';

// Re-export next-auth for convenience (these will be available when consuming app has next-auth)
export { default as NextAuth } from 'next-auth';
export { signIn, signOut, useSession } from 'next-auth/react';

// Export utility functions
export * from './utils/referral';
