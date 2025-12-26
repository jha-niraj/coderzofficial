// Middleware exports - Edge Runtime compatible
// These exports do NOT include next-auth/react which contains dynamic code evaluation
export { withAuth } from 'next-auth/middleware';
export type { NextRequestWithAuth } from 'next-auth/middleware';
