'use client';

import { FormEvent, useState, useRef, useEffect, JSX } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import {
    RefreshCw, CheckCircle2, Lock, Loader2
} from "lucide-react";
import {
    resetPasswordWithOTP, sendPasswordResetOTP
} from "@/actions/(auth)/auth/auth.actions";
import toast from '@repo/ui/components/ui/sonner';
import { motion } from 'framer-motion';

const ResetPassword = (): JSX.Element | null => {
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [email, setEmail] = useState<string | null>(null);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            router.push('/forgotpassword');
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (timer > 0 && !canResend) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timer === 0 && !canResend) {
            setCanResend(true);
        }
    }, [timer, canResend]);

    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d+$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs[index + 1]?.current?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs[index - 1]?.current?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("");
            setOtp(digits);
            inputRefs[5]?.current?.focus();
        }   
    };

    const handleResend = async () => {
        if (!email) return;
        try {
            const result = await sendPasswordResetOTP(email);
            if (result.success) {
                toast.success(result.message);
                setCanResend(false);
                setTimer(30);
                setOtp(["", "", "", "", "", ""]);
            } else {
                toast.error(result.error || "Failed to resend code");
            }
        } catch (error) {
            toast.error("Failed to resend code");
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error("Session invalid. Restart process.");
        if (password !== confirmPassword) return toast.error('Passwords do not match');
        if (password.length < 6) return toast.error('Password too short (min 6 chars)');
        if (otp.join("").length !== 6) return toast.error("Enter full 6-digit code");

        setIsLoading(true);
        try {
            const result = await resetPasswordWithOTP(email, otp.join(""), password);
            if (result.success) {
                setIsSuccess(true);
                toast.success("Password reset successfully!");
                setTimeout(() => router.push('/signin'), 2000);
            } else {
                toast.error(result.error || "Reset failed");
                setOtp(["", "", "", "", "", ""]);
                inputRefs[0]?.current?.focus() || null;
            } 
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col items-center justify-center font-sans">
                <div className="w-full max-w-md p-8 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400"
                    >
                        <CheckCircle2 className="w-10 h-10" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Password Reset</h2>
                    <p className="text-neutral-500 dark:text-neutral-400">Your security has been restored. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="w-full max-w-md px-4 relative z-10">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-4 text-neutral-900 dark:text-white">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Set New Password</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                            Enter the code sent to <span className="font-mono text-neutral-700 dark:text-neutral-300">{email}</span>
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Verification Code</Label>
                            <div className="flex justify-between gap-2">
                                {
                                    otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={inputRefs[index]}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            className="w-12 h-12 text-center text-xl font-bold p-0 rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
                                        />
                                    ))
                                }
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider" htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="h-11 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl font-medium transition-all"
                            disabled={isLoading || otp.join("").length !== 6}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
                        </Button>
                        <div className="text-center pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleResend}
                                disabled={!canResend}
                                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                <RefreshCw className={`mr-2 h-3 w-3 ${!canResend && "animate-spin"}`} />
                                {canResend ? "Resend Verification Code" : `Resend available in ${timer}s`}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;