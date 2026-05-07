export { auth, type Auth, type Session, type User } from "./auth.js";
export * from "./utils/referral.js";

// Convenience server-side helper — mirrors the old `auth()` / `getServerSession()` call shape.
// Usage in server actions/routes:
//   import { getSession } from "@repo/auth"
//   import { headers } from "next/headers"
//   const session = await getSession(headers())
export { getSession } from "./session.js";