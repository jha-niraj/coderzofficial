import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { AuthOptions, Account, Profile } from "./next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import { Role } from '@repo/prisma/client';
import { prisma } from '@repo/prisma';
import { 
    createSignupActivity, generateReferralCode, processReferral 
} from './utils/referral';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },
                password: {
                    label: "Password",
                    type: "password"
                },
                referralCode: {
                    label: "Referral Code",
                    type: "text"
                }
            },
            async authorize(credentials: Record<string, unknown> | undefined) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("EMAIL_PASSWORD_REQUIRED");
                }

                console.log("Authorizing user with email:", credentials.email);

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email as string
                        }
                    });

                    if (!user) {
                        throw new Error("USER_NOT_FOUND");
                    }

                    if (!user.hashedPassword) {
                        throw new Error("OAUTH_ACCOUNT");
                    }

                    // For special case where password is "verified" (after OTP verification)
                    if (credentials.password === "verified") {
                        const freshUser = await prisma.user.findUnique({
                            where: {
                                email: credentials.email as string
                            }
                        });

                        if (freshUser && freshUser.emailVerified) {
                            return {
                                id: freshUser.id,
                                email: freshUser.email!,
                                name: freshUser.name || freshUser.email || "User",
                                image: freshUser.image || null,
                                role: freshUser.role,
                                emailVerified: freshUser.emailVerified ? new Date() : null,
                            };
                        } else {
                            throw new Error("EMAIL_NOT_VERIFIED");
                        }
                    }

                    if (!user.emailVerified) {
                        throw new Error("EMAIL_NOT_VERIFIED");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password as string, user.hashedPassword);
                    console.log("Password Valid: " + isPasswordValid);

                    if (!isPasswordValid) {
                        throw new Error("INVALID_CREDENTIALS");
                    }

                    return {
                        id: user.id,
                        email: user.email!,
                        name: user.name || user.email || "User",
                        image: user.image || null,
                        role: user.role,
                        emailVerified: user.emailVerified ? new Date() : null,
                    };
                } catch (error) {
                    console.error("Authorization error:", error);
                    throw error;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_SECRET_ID || "",
            authorization: {
                params: {
                    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.events",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }: { token: JWT; user?: User; trigger?: "signIn" | "signUp" | "update" }) {
            if (user) {
                token.id = user.id!;
                token.role = user.role;
                token.emailVerified = user.emailVerified;
                
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: user.id! },
                        select: { onboardingCompleted: true }
                    });
                    token.onboardingCompleted = dbUser?.onboardingCompleted || false;
                } catch (error) {
                    token.onboardingCompleted = false;
                }
            }

            if (trigger === 'update' || token.onboardingCompleted === undefined) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: {
                            emailVerified: true,
                            role: true,
                            onboardingCompleted: true,
                        }
                    });

                    if (dbUser) {
                        token.emailVerified = dbUser.emailVerified ? new Date() : null;
                        token.role = dbUser.role;
                        token.onboardingCompleted = dbUser.onboardingCompleted ?? false;
                    }
                } catch (error) {
                    console.error('JWT callback error:', error);
                }
            }

            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
                session.user.emailVerified = token.emailVerified ? new Date() : null;
                (session.user as unknown as { onboardingCompleted: boolean }).onboardingCompleted = token.onboardingCompleted || false;
            }
            return session;
        },
        async signIn({ user, account, profile }: { 
            user: User; 
            account: Account | null; 
            profile?: Profile; 
        }) {
            if (account?.provider === 'google') {
                const existingUser = await prisma.user.findUnique({
                    where: { email: profile?.email as string }
                });

                if (existingUser) {
                    return true;
                }

                let referralCode = null;

                const state = account?.state ? account.state : null;
                if (state && typeof state === 'string') {
                    try {
                        const stateData = JSON.parse(state);
                        referralCode = stateData.referralCode;
                    } catch (e) {
                        console.error("Error parsing state data:", e);
                    }
                }

                setTimeout(async () => {
                    try {
                        const newUser = await prisma.user.findUnique({
                            where: { email: profile?.email as string }
                        });

                        if (newUser) {
                            await prisma.user.update({
                                where: {
                                    id: newUser.id
                                },
                                data: {
                                    referralCode: await generateReferralCode(newUser?.name as string),
                                    emailVerified: true,
                                    onboardingCompleted: false
                                }
                            });

                            if (referralCode) {
                                await processReferral(referralCode, newUser.id, profile?.name || 'a new user');
                            } else {
                                await createSignupActivity(newUser.id);
                            }
                        }
                    } catch (error) {
                        console.error("Error processing new Google user:", error);
                    }
                }, 1000);
            }

            return true;
        },
        async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`
            if (new URL(url).origin === baseUrl) return url
            
            const learnPlatformUrl = process.env.LEARN_PLATFORM_URL || 'https://learn.coderzai.xyz'
            if (url.startsWith(learnPlatformUrl)) {
                return url
            }
            
            return baseUrl
        },
    },
    pages: {
        signIn: '/signin',
        error: '/error',
        signOut: '/'
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
        csrfToken: {
            name: "next-auth.csrf-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
}

// Helper function for server-side auth check
export async function auth() {
    const { getServerSession } = await import('next-auth/next');
    return await getServerSession(authOptions);
}

// Export getServerSession for direct use
export { getServerSession } from 'next-auth/next';
