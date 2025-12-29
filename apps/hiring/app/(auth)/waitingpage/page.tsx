"use client"

import axios from 'axios';
import { useSession } from '@repo/auth/client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { Mail, CheckCircle, RefreshCw, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import toast from '@repo/ui/components/ui/sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';

const WaitingPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isChecking, setIsChecking] = useState(false);
    const [signingIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const email = searchParams.get('email');
        if (email) {
            setUserEmail(email);
        }
    }, [session, searchParams]);

    const checkVerificationStatus = async () => {
        if (!userEmail) return;

        setIsChecking(true);
        try {
            const response = await axios.get(`/api/user/verify-status/${userEmail}`);
            const user = response.data;

            if (!response) {
                toast.error('Please verify your email first.');
            } else {
                if (user.emailVerified) {
                    router.push("/signin");
                } else {
                    toast.info('Email not verified yet. Check your inbox.');
                }
            }
        } catch (error) {
            console.error('Error checking verification status:', error);
            toast.error('Failed to check verification status.');
        } finally {
            setIsChecking(false);
        }
    };

    const resendVerificationEmail = async () => {
        if (!userEmail) return;

        try {
            await axios.post('/api/resend-verification', { email: userEmail });
            toast.success('Verification email sent!');
        } catch (error) {
            console.error('Error resending verification email:', error);
            toast.error('Failed to resend. Try again.');
        }
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col items-center justify-center relative p-4">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                            CODER&apos;Z <span className="text-neutral-500 font-mono font-normal">HIRING</span>
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-neutral-900 dark:text-white" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                            Verification Required
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Check Your Email
                        </h1>
                        <p className="text-sm text-neutral-500 mt-2">
                            We&apos;ve sent a verification link to confirm your email.
                        </p>
                    </div>

                    {userEmail && (
                        <div className="text-center mb-6 p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
                                Sent to
                            </p>
                            <p className="font-mono text-neutral-900 dark:text-white">{userEmail}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={checkVerificationStatus}
                            disabled={isChecking || signingIn}
                            className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold"
                        >
                            {isChecking || signingIn ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {signingIn ? 'Signing In...' : 'Checking...'}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    I&apos;ve Verified My Email
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={resendVerificationEmail}
                            variant="outline"
                            className="w-full h-12 rounded-xl border-neutral-200 dark:border-neutral-800"
                            disabled={isChecking || signingIn}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Resend Verification Email
                        </Button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-neutral-500 mb-4">
                            Didn&apos;t receive it? Check spam folder.
                        </p>
                        <Button
                            onClick={() => router.push('/signin')}
                            variant="link"
                            className="text-neutral-900 dark:text-white"
                            disabled={isChecking || signingIn}
                        >
                            Back to Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function Waiting() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        }>
            <WaitingPage />
        </Suspense>
    )
}
