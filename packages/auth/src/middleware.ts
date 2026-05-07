import { auth } from "./auth";
import { NextRequest, NextResponse } from "next/server";

export type AuthSession = typeof auth.$Infer.Session;

/**
 * Get the current session from a Next.js middleware request.
 * Reads the session cookie directly — no extra network round-trip.
 */
export async function getSessionFromRequest(
    req: NextRequest,
): Promise<AuthSession | null> {
    const session = await auth.api.getSession({ headers: req.headers });
    return session as AuthSession | null;
}

/**
 * Redirect to sign-in, preserving the intended destination.
 */
export function redirectToSignIn(req: NextRequest): NextResponse {
    const url = new URL("/signin", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
}
