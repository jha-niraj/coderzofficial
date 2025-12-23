"use client"

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { Mail, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const WaitingPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isChecking, setIsChecking] = useState(false);
    const [signingIn, setSigningIn] = useState(false);
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
                    toast.info('Email not verified yet. Please check your inbox and click the verification link.');
                }
            }
        } catch (error) {
            console.error('Error checking verification status:', error);
            toast.error('Failed to check verification status. Please try again.');
        } finally {
            setIsChecking(false);
        }
    };

    const resendVerificationEmail = async () => {
        if (!userEmail) return;

        try {
            await axios.post('/api/resend-verification', { email: userEmail });
            toast.success('Verification email sent! Please check your inbox.');
        } catch (error) {
            console.error('Error resending verification email:', error);
            toast.error('Failed to resend verification email. Please try again.');
        }
    };

    return (
        <div className="flex items-center p-4 justify-center min-h-screen bg-white shadow-3xl rounded-2xl">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Check Your Email
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        We&apos;ve sent a verification link to your email address
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {
                        userEmail && (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Verification email sent to:</p>
                                <p className="font-medium text-gray-900">{userEmail}</p>
                            </div>
                        )
                    }
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            onClick={checkVerificationStatus}
                            disabled={isChecking || signingIn}
                            className="w-full"
                        >
                            {
                                isChecking || signingIn ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        {signingIn ? 'Signing In...' : 'Checking...'}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        I&apos;ve Verified My Email
                                    </>
                                )
                            }
                        </Button>
                        <Button
                            onClick={resendVerificationEmail}
                            variant="outline"
                            className="w-full"
                            disabled={isChecking || signingIn}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Resend Verification Email
                        </Button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-4">
                            Didn&apos;t receive the email? Check your spam folder or try resending.
                        </p>
                        <Button
                            onClick={() => router.push('/signin')}
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            disabled={isChecking || signingIn}
                        >
                            Back to Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default function Waiting() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WaitingPage />
        </Suspense>
    )
}