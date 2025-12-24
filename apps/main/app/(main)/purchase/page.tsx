'use client'

import { useState } from 'react'
import { useSession } from '@repo/auth'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Slider } from '@repo/ui/components/ui/slider'
import {
	Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import {
	Dialog, DialogContent
} from '@repo/ui/components/ui/dialog'
import { Badge } from '@repo/ui/components/ui/badge'
import {
	Receipt, Zap, Gift, AlertTriangle, ShieldCheck, Clock, Activity, Terminal, 
	Server, CheckCircle2, Loader2, Wallet
} from 'lucide-react'
import Link from 'next/link'
import toast from '@repo/ui/components/ui/sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { paymentConfig, calculatePrice } from '@/lib/payment-config'
import { computeUsageForCredits, creditUsageConfig, formatCountRange } from '@/lib/credit-usage'
import { submitCreditRequest } from '../../../actions/(main)/user/dashboard.action'
import { BentoPricing } from '@/components/ui/bento-pricing'

// Load Razorpay types
declare global {
	interface Window {
		Razorpay: any;
	}
}

export default function PurchasePage() {
	const { data: session } = useSession()
	const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')
	const [basicCredits, setBasicCredits] = useState(50)

	// UI States
	const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false)
	const [processingStatus, setProcessingStatus] = useState<'initializing' | 'processing' | 'verifying' | 'redirecting'>('initializing')
	const [isUsageSheetOpen, setIsUsageSheetOpen] = useState(false)

	// Transaction States
	const [pendingCredits, setPendingCredits] = useState<number | null>(null)
	const [pendingPrice, setPendingPrice] = useState<number | null>(null)
	const [usageSummary, setUsageSummary] = useState(() => computeUsageForCredits(50))

	// Form States
	const [requestCredits, setRequestCredits] = useState(25)
	const [linkedinPostUrl, setLinkedinPostUrl] = useState('')
	const [twitterPostUrl, setTwitterPostUrl] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Calculate Price Helper
	const calculateCustomPrice = (credits: number) => {
		const price = calculatePrice(credits, currency)
		return currency === 'INR' ? Math.round(price) : price.toFixed(2)
	}

	// Payment Logic
	const initiatePayment = async (credits: number, price: number) => {
		if (!session?.user) {
			toast.error('Please sign in to purchase credits')
			return
		}
		if (isProcessing) return

		try {
			setIsProcessing(true)
			setIsProcessingDialogOpen(true)
			setProcessingStatus('initializing')

			setProcessingStatus('processing')
			const response = await fetch('/api/payments/create-order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ credits, currency }),
			})

			const data = await response.json()
			if (!response.ok || !data.success) throw new Error(data.message || 'Failed to create order')

			const amountInSmallestUnit = currency === 'INR' ? Math.round(price * 100) : Math.round(price * 100);

			const options = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				amount: amountInSmallestUnit,
				currency: currency,
				name: 'TheCoderz',
				description: `Provision ${credits} Compute Credits`,
				image: '/titlelogo.jpeg',
				order_id: data.orderId,
				handler: async function (response: any) {
					try {
						document.body.classList.remove('rzp-open')
						setIsProcessingDialogOpen(true)
						setProcessingStatus('verifying')
						const verifyResponse = await fetch('/api/payments/verify', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_order_id: response.razorpay_order_id,
								razorpay_signature: response.razorpay_signature,
							}),
						})
						const verifyData = await verifyResponse.json()
						if (verifyResponse.ok && verifyData.success) {
							setProcessingStatus('redirecting')
							setTimeout(() => {
								window.location.href = `/purchase/success?paymentId=${verifyData.paymentId}&credits=${credits}&amount=${price}&currency=${currency}`
							}, 1000)
						} else {
							throw new Error(verifyData.message || 'Payment verification failed')
						}
					} catch (error: any) {
						toast.error(error.message || 'Verification failed')
						setIsProcessingDialogOpen(false)
						setIsProcessing(false)
					}
				},
				prefill: { name: session.user.name || '', email: session.user.email || '' },
				theme: { color: '#000000' },
				modal: {
					ondismiss: function () {
						document.body.classList.remove('rzp-open')
						setIsProcessingDialogOpen(false)
						setIsProcessing(false)
					},
				},
			}

			const rzp = new window.Razorpay(options)
			rzp.on('payment.failed', function () {
				toast.error('Payment failed')
				setIsProcessingDialogOpen(false)
				setIsProcessing(false)
			})
			setIsProcessingDialogOpen(false)
			await new Promise(requestAnimationFrame)
			document.body.classList.add('rzp-open')
			rzp.open()
		} catch (error: any) {
			toast.error(error.message)
			setIsProcessingDialogOpen(false)
			setIsProcessing(false)
		}
	}

	const openUsageSheet = (credits: number, price: number) => {
		if (!session?.user) {
			toast.error('Authentication required')
			return
		}
		setPendingCredits(credits)
		setPendingPrice(price)
		setUsageSummary(computeUsageForCredits(credits, creditUsageConfig))
		setIsUsageSheetOpen(true)
	}

	const handleRequestSubmit = async () => {
		if (!linkedinPostUrl.trim() && !twitterPostUrl.trim()) {
			toast.error('Please provide a post URL')
			return
		}
		try {
			setIsSubmitting(true)
			const result = await submitCreditRequest({
				requestedCredits: requestCredits,
				linkedinPostUrl: linkedinPostUrl.trim(),
				twitterPostUrl: twitterPostUrl.trim() || undefined
			})
			if (result.success) {
				toast.success("Request submitted via secure channel.")
				setIsRequestSheetOpen(false)
				setLinkedinPostUrl('')
				setTwitterPostUrl('')
			} else {
				toast.error(result.error)
			}
		} catch {
			toast.error('Transmission error')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen w-full bg-white dark:bg-neutral-950 relative overflow-hidden font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800">
			<div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
			<div className="container mx-auto px-6 py-24 max-w-7xl relative z-10">
				<div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="max-w-2xl"
					>
						<Badge variant="outline" className="mb-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 px-4 py-1.5 rounded-full text-neutral-600 dark:text-neutral-400">
							<Server className="w-3.5 h-3.5 mr-2" />
							Compute Provisioning
						</Badge>
						<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
							Scale your <br />
							<span className="text-neutral-400 dark:text-neutral-600">potential.</span>
						</h1>
						<p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
							Acquire compute credits to run specialized AI agents, perform system architecture simulations, and validate skills.
						</p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="flex flex-col items-end gap-4"
					>
						<div className="flex items-center gap-3 p-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
							<button
								onClick={() => setCurrency('INR')}
								className={`px-4 py-1.5 rounded-md text-sm font-bold font-mono transition-all ${currency === 'INR' ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
							>
								INR
							</button>
							<button
								onClick={() => setCurrency('USD')}
								className={`px-4 py-1.5 rounded-md text-sm font-bold font-mono transition-all ${currency === 'USD' ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
							>
								USD
							</button>
						</div>
						<div className="flex gap-3">
							<Button
								onClick={() => setIsRequestSheetOpen(true)}
								variant="outline"
								className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
							>
								<Gift className="w-4 h-4 mr-2" />
								Bounty Program
							</Button>
							<Button asChild variant="outline" className="border-neutral-200 dark:border-neutral-800">
								<Link href="/transactions">
									<Receipt className="w-4 h-4 mr-2" />
									History
								</Link>
							</Button>
						</div>
					</motion.div>
				</div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="mb-24"
				>
					<div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-1">
						<div className="bg-white dark:bg-neutral-950 rounded-xl p-8 md:p-12 shadow-sm border border-neutral-100 dark:border-neutral-800/50">

							<div className="grid md:grid-cols-12 gap-12 items-center">
								<div className="md:col-span-7 space-y-8">
									<div className="space-y-2">
										<Label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Allocation Amount</Label>
										<div className="relative group">
											<Input
												type="number"
												value={basicCredits}
												onChange={(e) => {
													const val = parseInt(e.target.value) || 0;
													if (val <= 1000) setBasicCredits(val);
												}}
												className="h-auto py-4 text-7xl md:text-8xl font-bold bg-transparent border-0 border-b-2 border-neutral-100 dark:border-neutral-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-neutral-900 dark:focus-visible:border-white transition-colors font-mono tracking-tight placeholder:text-neutral-200"
												placeholder="00"
											/>
											<span className="absolute right-0 bottom-8 text-xl font-medium text-neutral-400 dark:text-neutral-600">CREDITS</span>
										</div>
									</div>
									<div className="space-y-4">
										<div className="flex justify-between text-xs font-mono text-neutral-400">
											<span>{paymentConfig.minCredits}</span>
											<span>{paymentConfig.maxCredits}</span>
										</div>
										<Slider
											value={[basicCredits]}
											min={paymentConfig.minCredits}
											max={paymentConfig.maxCredits}
											step={10}
											onValueChange={(vals) => setBasicCredits(vals[0])}
											className="cursor-pointer"
										/>
									</div>
									<div className="flex gap-4 pt-4">
										<div className="flex items-center gap-2 text-sm text-neutral-500">
											<Terminal className="w-4 h-4" />
											<span>≈ {Math.floor(basicCredits / 20)} Projects</span>
										</div>
										<div className="flex items-center gap-2 text-sm text-neutral-500">
											<Activity className="w-4 h-4" />
											<span>≈ {Math.floor(basicCredits / 30)} Interviews</span>
										</div>
									</div>
								</div>
								<div className="md:col-span-5">
									<div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
										<div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
													<Zap className="w-5 h-5" />
												</div>
												<div>
													<div className="text-sm font-bold text-neutral-900 dark:text-white">Invoice Preview</div>
													<div className="text-xs text-neutral-500">One-time payment</div>
												</div>
											</div>
											<Badge variant="secondary">Draft</Badge>
										</div>
										<div className="space-y-3 mb-8">
											<div className="flex justify-between text-sm">
												<span className="text-neutral-500">Unit Price</span>
												<span className="font-mono text-neutral-900 dark:text-white">Dynamic</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-neutral-500">Quantity</span>
												<span className="font-mono text-neutral-900 dark:text-white">{basicCredits}</span>
											</div>
											<div className="flex justify-between text-sm pt-3 border-t border-neutral-200 dark:border-neutral-800">
												<span className="font-bold text-neutral-900 dark:text-white">Total</span>
												<span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
													{currency === 'INR' ? '₹' : '$'}
													{calculateCustomPrice(basicCredits)}
												</span>
											</div>
										</div>
										<Button
											onClick={() => openUsageSheet(basicCredits, Number(calculateCustomPrice(basicCredits)))}
											disabled={isProcessing || basicCredits < paymentConfig.minCredits}
											className="w-full h-12 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 font-bold"
										>
											{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Provision Resources"}
										</Button>

										{
											basicCredits < paymentConfig.minCredits && (
												<p className="text-xs text-red-500 text-center mt-3">
													Minimum allocation is {paymentConfig.minCredits} credits
												</p>
											)
										}
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
				<div className="mb-24">
					<div className="flex items-center gap-4 mb-8">
						<div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
						<span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Or Select Standard Tier</span>
						<div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
					</div>
					<BentoPricing
						currency={currency}
						onPurchase={(credits, price) => openUsageSheet(credits, price)}
						showFreeCredits={false}
						onRequestFreeCredits={() => setIsRequestSheetOpen(true)}
					/>
				</div>
				<div className="border-t border-neutral-200 dark:border-neutral-800 pt-10">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{
							[
								{ icon: ShieldCheck, label: "AES-256 Encryption", sub: "Bank-grade security" },
								{ icon: Clock, label: "Instant Allocation", sub: "<100ms processing" },
								{ icon: AlertTriangle, label: "No Expiration", sub: "Credits persist forever" },
								{ icon: Wallet, label: "Refund Policy", sub: "7-day guarantee" },
							].map((item, i) => (
								<div key={i} className="flex flex-col items-center md:items-start text-center md:text-left">
									<item.icon className="w-5 h-5 text-neutral-900 dark:text-white mb-2" />
									<div className="text-sm font-bold text-neutral-900 dark:text-white">{item.label}</div>
									<div className="text-xs text-neutral-500">{item.sub}</div>
								</div>
							))
						}
					</div>
				</div>
			</div>
			<Sheet open={isRequestSheetOpen} onOpenChange={setIsRequestSheetOpen}>
				<SheetContent className="w-full sm:w-[500px] border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
					<SheetHeader className="mb-6">
						<div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center mb-4">
							<Gift className="w-5 h-5 text-neutral-900 dark:text-white" />
						</div>
						<SheetTitle>Bounty Program</SheetTitle>
						<SheetDescription>
							Complete social tasks to earn compute credits.
						</SheetDescription>
					</SheetHeader>
					<div className="space-y-6">
						<div>
							<Label className="text-xs uppercase text-neutral-500 font-bold mb-3 block">Reward Size</Label>
							<div className="grid grid-cols-4 gap-2">
								{
									[10, 25, 50, 100].map((amount) => (
										<button
											key={amount}
											onClick={() => setRequestCredits(amount)}
											className={`py-2 rounded-md text-sm font-mono border transition-all ${requestCredits === amount
												? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900'
												: 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}
										>
											{amount}
										</button>
									))
								}
							</div>
						</div>
						<div className="space-y-4">
							<Label className="text-xs uppercase text-neutral-500 font-bold block">Proof of Execution</Label>
							<Input
								placeholder="LinkedIn Post URL"
								value={linkedinPostUrl}
								onChange={(e) => setLinkedinPostUrl(e.target.value)}
								className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
							/>
							<div className="text-center text-xs text-neutral-400 font-medium">- OR -</div>
							<Input
								placeholder="Twitter/X Post URL"
								value={twitterPostUrl}
								onChange={(e) => setTwitterPostUrl(e.target.value)}
								className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
							/>
						</div>
						<div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
							<div className="flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
								<AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
								<p>Post must be public and mention @thecoderz to pass verification.</p>
							</div>
						</div>
						<Button
							onClick={handleRequestSubmit}
							disabled={isSubmitting}
							className="w-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
						>
							{isSubmitting ? "Verifying..." : "Submit Claim"}
						</Button>
					</div>
				</SheetContent>
			</Sheet>
			<Sheet open={isUsageSheetOpen} onOpenChange={setIsUsageSheetOpen}>
				<SheetContent className="w-full sm:max-w-md border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
					<SheetHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-6 mb-6">
						<SheetTitle>Confirm Provisioning</SheetTitle>
						<SheetDescription>Verify allocation before executing transaction.</SheetDescription>
					</SheetHeader>
					<div className="space-y-6">
						<div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
							<span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Allocation</span>
							<span className="text-lg font-bold font-mono text-neutral-900 dark:text-white">{pendingCredits} CR</span>
						</div>
						<div className="space-y-3">
							<Label className="text-xs uppercase text-neutral-500 font-bold">Capacity Estimates</Label>
							{
								usageSummary.map((item) => (
									<div key={item.key} className="flex items-center gap-3 p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg">
										<div className="text-xl">{item.icon}</div>
										<div className="flex-1">
											<div className="text-sm font-bold text-neutral-900 dark:text-white">{item.title}</div>
											<div className="text-xs text-neutral-500">{formatCountRange(item.privateCount)} units</div>
										</div>
									</div>
								))
							}
						</div>
						<div className="pt-4">
							<Button
								onClick={() => pendingCredits && pendingPrice && initiatePayment(pendingCredits, pendingPrice)}
								disabled={isProcessing}
								className="w-full h-12 text-base bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
							>
								Pay {currency === 'INR' ? '₹' : '$'}{pendingPrice?.toFixed(2)}
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
			<Dialog open={isProcessingDialogOpen} onOpenChange={() => { }}>
				<DialogContent className="sm:max-w-sm border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
					<div className="flex flex-col items-center justify-center py-8 text-center">
						{
							processingStatus === 'redirecting' ? (
								<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
									<CheckCircle2 className="w-8 h-8 text-white" />
								</div>
							) : (
								<div className="relative w-16 h-16 mb-6">
									<div className="absolute inset-0 border-4 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
									<div className="absolute inset-0 border-4 border-neutral-900 dark:border-white rounded-full border-t-transparent animate-spin"></div>
								</div>
							)
						}
						<h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
							{processingStatus === 'initializing' && 'Handshaking...'}
							{processingStatus === 'processing' && 'Awaiting Gateway'}
							{processingStatus === 'verifying' && 'Verifying Token'}
							{processingStatus === 'redirecting' && 'Allocated!'}
						</h3>
						<p className="text-sm text-neutral-500 max-w-[200px]">
							{processingStatus === 'processing' ? 'Please complete the secure payment in the popup.' : 'Secure connection established.'}
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}