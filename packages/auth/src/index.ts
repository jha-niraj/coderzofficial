export { auth, type Auth, type Session, type User } from "./auth";
export * from "./utils/referral";

// Convenience server-side helper — mirrors the old `auth()` / `getServerSession()` call shape.
// Usage in server actions/routes:
//   import { getSession } from "@repo/auth"
//   import { headers } from "next/headers"
//   const session = await getSession(headers())
export { getSession } from "./session";