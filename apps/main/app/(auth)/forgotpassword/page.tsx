"use client"

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import axios from "axios";
import { useState } from "react";
import toast from "@repo/ui/components/ui/sonner";
import { useRouter } from "next/navigation";
import { 
    ArrowLeft, KeyRound, Loader2, Mail 
} from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
    const [email, setEmail] = useState<string>("");
    const [sending, setIsSending] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setIsSending(true);

        try {
            const response = await axios.post('/api/forgotpassword', { email, emailType: "RESET_PASSWORD_OTP" });
            if (response.status == 200) {
                toast.success('Reset instructions sent to your email');
                router.push(`/resetpassword?email=${encodeURIComponent(email)}`);
            } else {
                toast.error('Error sending reset code');
            }
        } catch (err: any) {
            console.error("Error sending password reset email:", err);
            toast.error('Failed to send reset email. Please try again.');
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="w-full max-w-md px-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-200 dark:from-neutral-800 dark:via-neutral-600 dark:to-neutral-800" />

                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-4 text-neutral-900 dark:text-white">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider" htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                <Input
                                    id="email"
                                    className="pl-10 h-11 bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white rounded-xl transition-all"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl font-medium transition-all"
                            type="submit"
                            disabled={sending}
                        >
                            {
                                sending ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                                    </span>
                                ) : "Send Reset Link"
                            }
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link
                            href="/signin"
                            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}