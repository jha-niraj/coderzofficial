"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from '@repo/auth';
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X, Gift, Code2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppContext } from "@/app/context/usercontext";

function SignUpForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setEmail: setContextEmail, setPassword: setContextPassword } =
        useAppContext();

    // Password validation states
    const [hasCapital, setHasCapital] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecial, setHasSpecial] = useState(false);
    const [hasMinLength, setHasMinLength] = useState(false);

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref) {
            setReferralCode(ref);
        }

        // Check for SSO callback
        const ssoCallback = searchParams.get("sso_callback");
        if (ssoCallback) {
            sessionStorage.setItem("sso_callback", ssoCallback);
        }
    }, [searchParams]);

    // Validate password as user types
    useEffect(() => {
        setHasCapital(/[A-Z]/.test(password));
        setHasNumber(/[0-9]/.test(password));
        setHasSpecial(/[!@#$%^&*(),.?":{}|<>]/.test(password));
        setHasMinLength(password.length >= 8);
    }, [password]);

    const isPasswordValid = hasCapital && hasNumber && hasSpecial && hasMinLength;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreedToTerms) {
            setError("Please agree to the Terms of Service and Privacy Policy");
            return;
        }

        if (!isPasswordValid) {
            setError("Please ensure your password meets all requirements");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post("/api/auth/register", {
                name,
                email,
                password,
                referralCode,
            });

            if (response.data.success) {
                // Store credentials in context for auto-fill on signin page
                setContextEmail(email);
                setContextPassword(password);

                // Check if there's an SSO callback to return to
                const ssoCallback = sessionStorage.getItem("sso_callback");
                if (ssoCallback) {
                    router.push(`/signin?sso_callback=${encodeURIComponent(ssoCallback)}`);
                } else {
                    router.push("/signin?registered=true");
                }
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "An error occurred during registration");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setIsGoogleLoading(true);
            const ssoCallback = sessionStorage.getItem("sso_callback");

            await signIn("google", {
                callbackUrl: ssoCallback || "/dashboard",
            });
        } catch {
            setError("Google sign-up failed. Please try again.");
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Section - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 flex-col justify-center items-center overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute left-8 top-1/4 flex flex-col gap-2">
                    <div className="w-1 h-24 bg-gradient-to-b from-orange-500 to-transparent rounded-full" />
                    <div className="w-1 h-16 bg-gradient-to-b from-orange-400/60 to-transparent rounded-full" />
                    <div className="w-1 h-8 bg-gradient-to-b from-orange-300/40 to-transparent rounded-full" />
                </div>

                {/* Orange Circle */}
                <div className="absolute right-16 top-1/3 w-32 h-32 rounded-full bg-orange-500/20 blur-xl" />
                <div className="absolute right-20 top-1/3 w-24 h-24 rounded-full bg-orange-500/30 blur-lg" />

                {/* Content */}
                <div className="relative z-10 px-12 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <Code2 className="h-8 w-8 text-orange-500" />
                            </div>
                            <span className="text-2xl font-bold text-white">TheCoderz</span>
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-4">
                            Join the <span className="text-orange-500">Community</span>
                        </h1>
                        <p className="text-zinc-400 text-lg mb-8">
                            Build projects, learn from peers, and grow your skills with
                            thousands of developers worldwide.
                        </p>

                        {/* Motivational Quote */}
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                            <p className="text-zinc-300 italic text-lg">
                                &quot;Every expert was once a beginner.&quot;
                            </p>
                            <p className="text-orange-500 mt-2 text-sm">
                                — Start your journey today
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Decoration */}
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                        <div className="w-2 h-2 rounded-full bg-orange-500/25" />
                    </div>
                    <p className="text-zinc-500 text-sm">Empowering developers since 2024</p>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-zinc-900">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <Code2 className="h-6 w-6 text-orange-500" />
                        </div>
                        <span className="text-xl font-bold dark:text-white">TheCoderz</span>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold dark:text-white">Create an account</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                            Start your developer journey with us
                        </p>
                    </div>

                    {/* Referral Code Banner */}
                    <AnimatePresence>
                        {referralCode && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <Gift className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium dark:text-white">
                                            Referral bonus applied!
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            You&apos;ll receive 100 bonus credits upon signup
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                            >
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Google Sign Up */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 mb-6 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
                        onClick={handleGoogleSignUp}
                        disabled={isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                            <div className="h-5 w-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <FcGoogle className="h-5 w-5 mr-2" />
                                Continue with Google
                            </>
                        )}
                    </Button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-zinc-900 text-zinc-500">
                                or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium dark:text-zinc-300">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-12 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-orange-500"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium dark:text-zinc-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-orange-500"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium dark:text-zinc-300">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a secure password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 pr-12 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-orange-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                                >
                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                        Password requirements:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            {hasMinLength ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-zinc-400" />
                                            )}
                                            <span className={`text-xs ${hasMinLength ? "text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                                                8+ characters
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasCapital ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-zinc-400" />
                                            )}
                                            <span className={`text-xs ${hasCapital ? "text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                                                Uppercase letter
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasNumber ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-zinc-400" />
                                            )}
                                            <span className={`text-xs ${hasNumber ? "text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                                                Number
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasSpecial ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-zinc-400" />
                                            )}
                                            <span className={`text-xs ${hasSpecial ? "text-green-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                                                Special character
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 pt-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                className="mt-0.5 border-zinc-300 dark:border-zinc-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                            <Label
                                htmlFor="terms"
                                className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed cursor-pointer"
                            >
                                I agree to the{" "}
                                <Link href="/termsofservice" className="text-orange-500 hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacypolicy" className="text-orange-500 hover:underline">
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading || !agreedToTerms}
                            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium mt-6"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    {/* Sign In Link */}
                    <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400">
                        Already have an account?{" "}
                        <Link
                            href="/signin"
                            className="text-orange-500 hover:text-orange-600 font-medium hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900">
                    <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <SignUpForm />
        </Suspense>
    );
}
