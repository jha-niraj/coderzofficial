import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
});

export const {
    signIn,
    signOut,
    signUp,
    useSession,
    getSession,
} = authClient;