import { auth } from "./auth";
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export type SessionUser = {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role?: string;
    onboardingCompleted?: boolean;
    emailVerified?: boolean;
    [key: string]: unknown;
};

export type AppSession = {
    user: SessionUser;
    session: { id: string; expiresAt: Date; [key: string]: unknown };
} | null;

/**
 * Server-side session helper. Drop-in for the old `getServerSession(authOptions)` / `auth()` pattern.
 *
 * Usage in a Server Action or Route Handler:
 *   import { getSession } from "@repo/auth"
 *   import { headers } from "next/headers"
 *   const session = await getSession(headers())
 *   if (!session) return { error: "Unauthorized" }
 *   const userId = session.user.id
 */
export async function getSession(
    reqHeaders: ReadonlyHeaders | Headers | Promise<ReadonlyHeaders | Headers>,
): Promise<AppSession> {
    const resolved = await reqHeaders;
    const result = await auth.api.getSession({ headers: resolved as Headers });
    if (!result) return null;
    return result as AppSession;
}