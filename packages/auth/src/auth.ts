import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
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

// Extended GitHub profile type
interface GitHubProfile extends Profile {
    login?: string | null;
    id?: number;
    avatar_url?: string | null;
    name?: string | null;
    email?: string | null;
    bio?: string | null;
    location?: string | null;
    company?: string | null;
    blog?: string | null;
    public_repos?: number;
    public_gists?: number;
    followers?: number;
    following?: number;
}

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
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_SECRET_ID || "",
            authorization: {
                params: {
                    scope: "read:user user:email repo",
                },
            },
            profile(profile: GitHubProfile) {
                // Note: githubUsername is NOT stored on User - it's stored in OSGitHubProfile
                // which is created/updated in the signIn callback
                return {
                    id: String(profile.id),
                    name: profile.name || profile.login || "GitHub User",
                    email: profile.email || "",
                    image: profile.avatar_url || null,
                    role: Role.Student,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }: { token: JWT; user?: User; trigger?: "signIn" | "signUp" | "update" }) {
            if (user) {
                token.id = user.id!;
                token.role = user.role;
                token.emailVerified = user.emailVerified;
                // githubUsername is fetched from osGitHubProfile below

                try {
                    const dbUser = await prisma.user.findUnique({
                        where: {
                            id: user.id!
                        },
                        select: {
                            onboardingCompleted: true,
                            osGitHubProfile: {
                                select: {
                                    githubUsername: true
                                }
                            }
                        }
                    });
                    token.onboardingCompleted = dbUser?.onboardingCompleted || false;
                    token.githubUsername = dbUser?.osGitHubProfile?.githubUsername || null;
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
                            osGitHubProfile: {
                                select: {
                                    githubUsername: true
                                }
                            }
                        }
                    });

                    if (dbUser) {
                        token.emailVerified = dbUser.emailVerified ? new Date() : null;
                        token.role = dbUser.role;
                        token.onboardingCompleted = dbUser.onboardingCompleted ?? false;
                        token.githubUsername = dbUser.osGitHubProfile?.githubUsername;
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
                (session.user as unknown as { githubUsername: string | null }).githubUsername = token.githubUsername as string | null || null;
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

            // Handle GitHub sign in
            if (account?.provider === 'github') {
                const githubProfile = profile as GitHubProfile;
                const existingUser = await prisma.user.findUnique({
                    where: {
                        email: githubProfile?.email as string
                    },
                    select: {
                        id: true,
                        osGitHubProfile: {
                            select: {
                                githubUsername: true
                            }
                        }
                    }
                });

                if (existingUser) {

                    // Create or update GitHub profile for opensource
                    try {
                        await prisma.oSGitHubProfile.upsert({
                            where: { userId: existingUser.id },
                            update: {
                                githubUsername: githubProfile?.login || '',
                                githubName: githubProfile?.name,
                                githubAvatar: githubProfile?.avatar_url,
                                githubBio: githubProfile?.bio,
                                githubLocation: githubProfile?.location,
                                githubCompany: githubProfile?.company,
                                githubBlog: githubProfile?.blog,
                                publicRepos: githubProfile?.public_repos || 0,
                                publicGists: githubProfile?.public_gists || 0,
                                followers: githubProfile?.followers || 0,
                                following: githubProfile?.following || 0,
                                accessToken: account?.access_token,
                                scopes: account?.scope?.split(',') || [],
                                lastSyncedAt: new Date(),
                            },
                            create: {
                                userId: existingUser.id,
                                githubId: String(githubProfile?.id),
                                githubUsername: githubProfile?.login || '',
                                githubName: githubProfile?.name,
                                githubAvatar: githubProfile?.avatar_url,
                                githubBio: githubProfile?.bio,
                                githubLocation: githubProfile?.location,
                                githubCompany: githubProfile?.company,
                                githubBlog: githubProfile?.blog,
                                publicRepos: githubProfile?.public_repos || 0,
                                publicGists: githubProfile?.public_gists || 0,
                                followers: githubProfile?.followers || 0,
                                following: githubProfile?.following || 0,
                                accessToken: account?.access_token,
                                scopes: account?.scope?.split(',') || [],
                                lastSyncedAt: new Date(),
                            }
                        });
                    } catch (error) {
                        console.error("Error creating/updating GitHub profile:", error);
                    }

                    return true;
                }

                // New user via GitHub
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
                            where: {
                                email: githubProfile?.email as string
                            }
                        });

                        if (newUser) {
                            await prisma.user.update({
                                where: { id: newUser.id },
                                data: {
                                    referralCode: await generateReferralCode(newUser?.name as string),
                                    emailVerified: true,
                                    onboardingCompleted: false,
                                }
                            });

                            // Create GitHub profile for new user
                            try {
                                await prisma.oSGitHubProfile.create({
                                    data: {
                                        userId: newUser.id,
                                        githubId: String(githubProfile?.id),
                                        githubUsername: githubProfile?.login || '',
                                        githubName: githubProfile?.name,
                                        githubAvatar: githubProfile?.avatar_url,
                                        githubBio: githubProfile?.bio,
                                        githubLocation: githubProfile?.location,
                                        githubCompany: githubProfile?.company,
                                        githubBlog: githubProfile?.blog,
                                        publicRepos: githubProfile?.public_repos || 0,
                                        publicGists: githubProfile?.public_gists || 0,
                                        followers: githubProfile?.followers || 0,
                                        following: githubProfile?.following || 0,
                                        accessToken: account?.access_token,
                                        scopes: account?.scope?.split(',') || [],
                                        lastSyncedAt: new Date(),
                                    }
                                });
                            } catch (error) {
                                console.error("Error creating GitHub profile for new user:", error);
                            }

                            if (referralCode) {
                                await processReferral(referralCode, newUser.id, githubProfile?.name || 'a new user');
                            } else {
                                await createSignupActivity(newUser.id);
                            }
                        }
                    } catch (error) {
                        console.error("Error processing new GitHub user:", error);
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