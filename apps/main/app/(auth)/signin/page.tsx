"use client"

import type React from "react";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, Code2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { signIn, useSession } from '@repo/auth/client';
import toast from '@repo/ui/components/ui/sonner'
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/app/context/usercontext";
import { getAuthErrorMessage, shouldRedirectToVerification } from "@/lib/auth-errors";
import { cn } from "@repo/ui/lib/utils";

function SearchParamsLoader() {
    const searchParams = useSearchParams();
    return <SignInForm searchParams={searchParams} />;
}

interface SignInFormProps {
    searchParams: ReturnType<typeof useSearchParams>;
}

function SignInForm({ searchParams }: SignInFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { email, setEmail, password, setPassword } = useAppContext();
    const [showPassword, setShowPassword] = useState(false);
    const [googleSignIn, setGoogleSignIn] = useState<boolean>(false);
    const [githubSignIn, setGithubSignIn] = useState<boolean>(false);
    const router = useRouter();
    const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
    const { data: session } = useSession();

    // Redirect if already authenticated
    useEffect(() => {
        if (session) {
            router.push(callbackUrl);
        }
    }, [session, callbackUrl, router]);

    // Check if user just verified their email
    useEffect(() => {
        const verified = searchParams?.get("verified");
        if (verified === "true") {
            toast.success("Email verified successfully! You can now sign in.");
        }
    }, [searchParams]);

    const handleSignInWithGoogle = async () => {
        try {
            setGoogleSignIn(true)
            await signIn.social({ provider: 'google', callbackURL: callbackUrl })
        } catch {
            toast.error('Failed to sign in with Google')
            setGoogleSignIn(false)
        }
    }

    const handleSignInWithGitHub = async () => {
        try {
            setGithubSignIn(true)
            await signIn.social({ provider: 'github', callbackURL: callbackUrl })
        } catch {
            toast.error('Failed to sign in with GitHub')
            setGithubSignIn(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const validationResponse = await fetch('/api/auth/validate-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const validationData = await validationResponse.json();

            if (!validationData.success) {
                const errorMessage = getAuthErrorMessage(validationData.error);
                toast.error(errorMessage);
                if (shouldRedirectToVerification(validationData.error)) {
                    setTimeout(() => router.push("/verify?email=" + encodeURIComponent(email)), 2000);
                }
                return;
            }

            const result = await signIn.email({ email, password, callbackURL: callbackUrl });

            if (result?.error) {
                toast.error("Sign in failed. Please try again.");
                return;
            }

            if (result?.data) {
                toast.success("Welcome back!");
                router.push(callbackUrl);
            } else {
                toast.error("Sign in failed. Please try again.");
            }
        } catch {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const registerUrl = callbackUrl && callbackUrl !== '/dashboard'
        ? "/register?callbackUrl=" + encodeURIComponent(callbackUrl)
        : "/register";

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 bg-neutral-100 dark:bg-neutral-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row rounded-3xl shadow-2xl"
            >
                {/* Background Elements */}
                <div className="w-full h-full z-[2] absolute bg-gradient-to-t from-transparent to-black/50 pointer-events-none md:hidden" />
                <div className="hidden md:flex absolute z-[2] overflow-hidden backdrop-blur-2xl pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-[40rem] z-[2] w-[4rem] bg-gradient-to-r from-transparent via-black/20 to-white/10 opacity-30" />
                    ))}
                </div>
                <div className="w-[15rem] h-[15rem] bg-orange-500 absolute z-[1] rounded-full -bottom-20 -left-20 blur-3xl opacity-50" />
                <div className="w-[8rem] h-[8rem] bg-orange-400 absolute z-[1] rounded-full bottom-10 left-10 blur-2xl opacity-30" />

                {/* Left Panel */}
                <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden flex flex-col justify-between min-h-[200px] md:min-h-[600px]">
                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <Code2 className="h-8 w-8 text-orange-500" />
                            <span className="font-bold text-xl">The Coderz</span>
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-medium leading-tight tracking-tight">
                            Build projects. Crack interviews. Land your dream job.
                        </h1>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/60 text-sm mt-4 md:mt-0 relative z-10"
                    >
                        &quot;Every expert was once a beginner. Start your journey today.&quot;
                    </motion.p>
                </div>

                {/* Right Panel */}
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white dark:bg-neutral-900 z-10">
                    <div className="flex flex-col items-start mb-8">
                        <div className="text-orange-500 mb-4">
                            <Code2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-medium mb-2 tracking-tight text-neutral-900 dark:text-white">
                            Welcome Back
                        </h2>
                        <p className="text-left text-neutral-600 dark:text-neutral-400">
                            Sign in to continue your coding journey
                        </p>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                        <div>
                            <Label htmlFor="email" className="block text-sm mb-2 text-neutral-700 dark:text-neutral-300">
                                Email address
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                className={cn(
                                    "text-sm w-full py-2.5 px-3 border rounded-lg",
                                    "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent",
                                    "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
                                    "text-neutral-900 dark:text-white"
                                )}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="password" className="block text-sm text-neutral-700 dark:text-neutral-300">
                                    Password
                                </Label>
                                <Link href="/forgotpassword" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="••••••••"
                                    className={cn(
                                        "text-sm w-full py-2.5 px-3 pr-10 border rounded-lg",
                                        "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent",
                                        "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
                                        "text-neutral-900 dark:text-white"
                                    )}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors mt-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                type="button"
                                disabled={isSubmitting || googleSignIn || githubSignIn}
                                onClick={handleSignInWithGoogle}
                                className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            >
                                {googleSignIn ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                disabled={isSubmitting || googleSignIn || githubSignIn}
                                onClick={handleSignInWithGitHub}
                                className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            >
                                {githubSignIn ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                        GitHub
                                    </>
                                )}
                            </Button>
                        </div>

                        <p className="text-center text-neutral-600 dark:text-neutral-400 text-sm mt-4">
                            Don&apos;t have an account?{" "}
                            <Link href={registerUrl} className="text-orange-500 font-medium hover:underline">
                                Create account
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-950">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        }>
            <SearchParamsLoader />
        </Suspense>
    );
}
