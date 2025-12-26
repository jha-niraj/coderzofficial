"use client"

import type React from "react"
import { useState, useRef, useEffect, Suspense } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import {
	CheckCircle2, RefreshCw, ShieldCheck, Loader2
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from '@repo/ui/components/ui/sonner'
import { verifyOTP, resendVerificationOTP } from "@/actions/(auth)/auth/auth.actions"
import { signIn } from '@repo/auth/client';
import { motion } from "framer-motion"

function VerifyContent() {
	const [isLoading, setIsLoading] = useState(false)
	const [isVerified, setIsVerified] = useState(false)
	const [timer, setTimer] = useState(30)
	const [canResend, setCanResend] = useState(false)
	const [email, setEmail] = useState<string | null>(null)
	const router = useRouter()
	const searchParams = useSearchParams()

	const inputRefs = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	]

	const [code, setCode] = useState(["", "", "", "", "", ""])

	useEffect(() => {
		const emailParam = searchParams.get('email')
		if (emailParam) {
			setEmail(emailParam)
		} else {
			router.push('/register')
		}
	}, [searchParams, router])

	useEffect(() => {
		if (timer > 0 && !canResend) {
			const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
			return () => clearInterval(interval)
		} else if (timer === 0 && !canResend) {
			setCanResend(true)
		}
	}, [timer, canResend])

	const handleInputChange = (index: number, value: string) => {
		if (value && !/^\d+$/.test(value)) return
		const newCode = [...code]
		newCode[index] = value
		setCode(newCode)
		if (value && index < 5) inputRefs[index + 1]?.current?.focus()
	}

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !code[index] && index > 0) inputRefs[index - 1]?.current?.focus()
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault()
		const pastedData = e.clipboardData.getData("text/plain").trim()
		if (/^\d{6}$/.test(pastedData)) {
			const digits = pastedData.split("")
			setCode(digits)
			inputRefs[5]?.current?.focus()
		}
	}

	const handleResend = async () => {
		if (!email) return
		try {
			const result = await resendVerificationOTP(email)
			if (result.success) {
				toast.success(result.message)
				setCanResend(false)
				setTimer(30)
				setCode(["", "", "", "", "", ""])
			} else {
				toast.error(result.error || "Failed to resend")
			}
		} catch {
			toast.error("Failed to resend code")
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email) return toast.error("Session invalid")
		if (code.join("").length !== 6) return toast.error("Enter full 6-digit code")

		setIsLoading(true)
		try {
			const otp = code.join("")
			const result = await verifyOTP(email, otp)

			if (result.success) {
				setIsVerified(true)
				toast.success("Email verified successfully!")

				const signInResult = await signIn('credentials', {
					email: email,
					password: "verified",
					redirect: false
				})

				if (signInResult?.ok) {
					const redirectUri = searchParams.get('redirect_uri');
					const state = searchParams.get('state');
					const isLearnPlatformRequest = redirectUri?.includes('learn.');

					if (isLearnPlatformRequest && redirectUri) {
						setTimeout(() => {
							const ssoUrl = new URL('/api/auth/signin', window.location.origin);
							ssoUrl.searchParams.set('redirect_uri', redirectUri);
							if (state) ssoUrl.searchParams.set('state', state);
							window.location.href = ssoUrl.toString();
						}, 1500);
					} else {
						setTimeout(() => router.push('/onboarding'), 1500);
					}
				} else {
					setTimeout(() => router.push('/signin?verified=true'), 1500);
				}
			} else {
				toast.error(result.error || "Invalid code")
				setCode(["", "", "", "", "", ""])
				inputRefs[0]?.current?.focus();
			}
		} catch {
			toast.error("Verification failed")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen w-full bg-white dark:bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
			<div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

			<div className="w-full max-w-md px-4 relative z-10">
				<div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8">
					<div className="text-center mb-8">
						{
							isVerified ? (
								<motion.div
									initial={{ scale: 0.5, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400"
								>
									<CheckCircle2 className="w-8 h-8" />
								</motion.div>
							) : (
								<div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-neutral-900 dark:text-white">
									<ShieldCheck className="w-6 h-6" />
								</div>
							)
						}
						<h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
							{isVerified ? "Verified Successfully" : "Verify Email"}
						</h2>
						<p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
							{isVerified ? "Securing session & logging you in..." : `Enter code sent to ${email}`}
						</p>
					</div>
					{
						!isVerified && (
							<form onSubmit={handleSubmit} className="space-y-8">
								<div className="flex justify-between gap-2">
									{
										code.map((digit, index) => (
											<Input
												key={index}
												ref={inputRefs[index]}
												type="text"
												maxLength={1}
												value={digit}
												onChange={(e) => handleInputChange(index, e.target.value)}
												onKeyDown={(e) => handleKeyDown(index, e)}
												onPaste={index === 0 ? handlePaste : undefined}
												className="w-12 h-12 text-center text-xl font-bold p-0 rounded-lg bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
											/>
										))
									}
								</div>
								<Button
									type="submit"
									className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl font-medium transition-all"
									disabled={isLoading || code.join("").length !== 6}
								>
									{
										isLoading ? (
											<span className="flex items-center gap-2">
												<Loader2 className="w-4 h-4 animate-spin" /> Verifying...
											</span>
										) : (
											"Verify & Continue"
										)
									}
								</Button>
								<div className="text-center">
									<Button
										type="button"
										variant="ghost"
										onClick={handleResend}
										disabled={!canResend}
										className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
									>
										<RefreshCw className={`mr-2 h-3 w-3 ${!canResend && "animate-spin"}`} />
										{canResend ? "Resend Code" : `Resend available in ${timer}s`}
									</Button>
								</div>
							</form>
						)
					}
				</div>
			</div>
		</div>
	)
}

export default function Verify() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
				<Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
			</div>
		}>
			<VerifyContent />
		</Suspense>
	)
}