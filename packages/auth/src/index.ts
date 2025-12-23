// Export auth configuration and helpers
export { authOptions, auth, getServerSession } from './auth';

// Export types from next-auth.d.ts
export type { AuthOptions, Account, Profile } from './next-auth';

// Re-export next-auth for convenience
export { default as NextAuth } from 'next-auth';

// Client-side exports
export { signIn, signOut, useSession, SessionProvider } from 'next-auth/react';

// Middleware exports
export { withAuth } from 'next-auth/middleware';
export type { NextRequestWithAuth } from 'next-auth/middleware';

// Server-side helpers - re-export from next-auth
export { getServerSession as getSession } from 'next-auth/next';

// Export utility functions
export * from './utils/referral';