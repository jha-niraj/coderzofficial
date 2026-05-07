import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, users, accounts, sessions, verifications } from "@repo/db";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
    database: drizzleAdapter(db as unknown as Parameters<typeof drizzleAdapter>[0], {
        provider: "pg",
        schema: {
            user: users,
            session: sessions,
            account: accounts,
            verification: verifications,
        },
    }),

    // ─── Email + Password ────────────────────────────────────────────────────
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        minPasswordLength: 8,
        password: {
            hash: (password) => bcrypt.hash(password, 10),
            verify: ({ hash, password }) => bcrypt.compare(password, hash),
        },
    },

    // ─── Social Providers ────────────────────────────────────────────────────
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET_ID)!,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_SECRET_ID!,
        },
    },

    // ─── Custom user fields (stored on the users table) ──────────────────────
    user: {
        additionalFields: {
            role: { type: "string" as const, defaultValue: "Student", input: false },
            onboardingStep: { type: "number" as const, defaultValue: 0, input: false },
            onboardingCompleted: { type: "boolean" as const, defaultValue: false, input: false },
            username: { type: "string" as const, required: false },
            referralCode: { type: "string" as const, required: false, input: false },
            totalCredits: { type: "number" as const, defaultValue: 0, input: false },
            totalXp: { type: "number" as const, defaultValue: 0, input: false },
            currentLevel: { type: "number" as const, defaultValue: 1, input: false },
            bio: { type: "string" as const, required: false },
            headline: { type: "string" as const, required: false },
            location: { type: "string" as const, required: false },
            githubUrl: { type: "string" as const, required: false },
            linkedinUrl: { type: "string" as const, required: false },
            twitterUrl: { type: "string" as const, required: false },
            websiteUrl: { type: "string" as const, required: false },
        },
    },

    // ─── Session config ───────────────────────────────────────────────────────
    session: {
        expiresIn: 60 * 60 * 24 * 30,  // 30 days
        updateAge: 60 * 60 * 24,         // refresh daily
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,              // 5-minute client-side cache
        },
    },

    // ─── App config ───────────────────────────────────────────────────────────
    secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    basePath: "/api/auth",

    trustedOrigins: [
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        process.env.NEXT_PUBLIC_UNI_URL || "http://localhost:3001",
        process.env.NEXT_PUBLIC_HIRING_URL || "http://localhost:3002",
        process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3003",
    ].filter(Boolean) as string[],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
