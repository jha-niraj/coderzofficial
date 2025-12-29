"use client"

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import axios from "axios";
import React, { useState } from "react";
import toast from "@repo/ui/components/ui/sonner";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, KeyRound, Loader2, Mail, Building2, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";

export default function ForgotPassword() {
    const [email, setEmail] = useState<string>("");
    const [sending, setIsSending] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setIsSending(true);

        try {
            const response = await axios.post('/api/forgotpassword', { email, emailType: "RESET_PASSWORD_OTP" });
            if (response.status == 200) {
                toast.success('Reset code sent to your email');
                router.push(`/resetpassword?email=${encodeURIComponent(email)}`);
            } else {
                toast.error('Error sending reset code');
            }
        } catch (error) {
            console.error("Error sending password reset email:", error);
            toast.error('Failed to send reset email. Please try again.');
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col items-center justify-center relative p-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
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
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-6 h-6 text-neutral-900 dark:text-white" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                            Account Recovery
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Reset Access Credentials
                        </h1>
                        <p className="text-sm text-neutral-500 mt-2">
                            Enter your email to receive a recovery code.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-mono uppercase tracking-wider text-neutral-500" htmlFor="email">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    id="email"
                                    className={cn(
                                        "h-12 pl-11 rounded-xl bg-white dark:bg-neutral-950",
                                        "border-neutral-200 dark:border-neutral-800",
                                        "focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                                    )}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold"
                            type="submit"
                            disabled={sending}
                        >
                            {
                                sending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Recovery Code
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )
                            }
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link
                            href="/signin"
                            className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}