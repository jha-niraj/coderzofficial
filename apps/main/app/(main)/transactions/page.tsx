"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useSession } from '@repo/auth'
import {
	Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
	Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
	Receipt, ArrowUpRight, ArrowDownLeft, Calendar, Clock, ExternalLink, RefreshCw, CreditCard, Send
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface CreditTransaction {
	id: string
	amount: number
	type: "PURCHASE" | "SPEND" | "BONUS" | "REWARD"
	currency: "INR" | "USD" | "NA"
	description: string
	createdAt: string
}

interface CreditTransferOut {
	id: string
	creditsTransferred: number
	destinationPlatform: string
	transferId: string
	status: string
	createdAt: string
	ipAddress?: string
	userAgent?: string
}

export default function TransactionsPage() {
	const { data: session, status } = useSession()
	const [transactions, setTransactions] = useState<CreditTransaction[]>([])
	const [transfers, setTransfers] = useState<CreditTransferOut[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)

	const fetchData = async () => {
		try {
			setRefreshing(true)

			// Fetch transactions
			const transactionsRes = await fetch('/api/transactions')
			if (transactionsRes.ok) {
				const transactionsData = await transactionsRes.json()
				setTransactions(transactionsData.transactions || [])
			}

			// Fetch transfers
			const transfersRes = await fetch('/api/transfers')
			if (transfersRes.ok) {
				const transfersData = await transfersRes.json()
				setTransfers(transfersData.transfers || [])
			}
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setIsLoading(false)
			setRefreshing(false)
		}
	}

	useEffect(() => {
		if (status === "authenticated") {
			fetchData()
		}
	}, [status])

	const getTransactionIcon = (type: string) => {
		switch (type) {
			case "PURCHASE":
				return <CreditCard className="h-4 w-4 text-green-600" />
			case "SPEND":
				return <ArrowUpRight className="h-4 w-4 text-red-600" />
			case "BONUS":
				return <ArrowDownLeft className="h-4 w-4 text-blue-600" />
			case "REWARD":
				return <ArrowDownLeft className="h-4 w-4 text-purple-600" />
			default:
				return <Receipt className="h-4 w-4 text-gray-600" />
		}
	}

	const getTransactionColor = (type: string) => {
		switch (type) {
			case "PURCHASE":
				return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
			case "SPEND":
				return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400"
			case "BONUS":
				return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
			case "REWARD":
				return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
			default:
				return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400"
			case "PENDING":
				return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
			case "FAILED":
				return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400"
			default:
				return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
		}
	}

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a")
		} catch (error) {
			return "Invalid date"
		}
	}

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
				<div className="container mx-auto px-4 py-8 max-w-6xl">
					<div className="animate-pulse space-y-8">
						<div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
						<div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
						<div className="h-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
					</div>
				</div>
			</div>
		)
	}

	if (status === "unauthenticated") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
				<div className="container mx-auto px-4 py-8 max-w-6xl">
					<div className="text-center py-16">
						<h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
							Authentication Required
						</h1>
						<p className="text-slate-600 dark:text-slate-400 mb-8">
							Please sign in to view your transactions and transfers.
						</p>
						<Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
							<Link href="/signin">Sign In</Link>
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-black dark:via-gray-950 dark:to-black">
			<div className="container mx-auto px-4 py-16 max-w-6xl">
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
								<Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
									Transaction History
								</h1>
								<p className="text-slate-600 dark:text-slate-400">
									Track your credit purchases, spending, and transfers
								</p>
							</div>
						</div>
						<Button
							onClick={fetchData}
							disabled={refreshing}
							variant="outline"
							className="gap-2"
						>
							<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
					</div>
				</div>
				<Tabs defaultValue="transactions" className="space-y-6">
					<TabsList className="grid w-full grid-cols-2 bg-white dark:bg-neutral-900 shadow-2xl p-2 rounded-xl">
						<TabsTrigger value="transactions" className="flex items-center gap-2">
							<CreditCard className="h-4 w-4" />
							Credit Transactions
						</TabsTrigger>
						<TabsTrigger value="transfers" className="flex items-center gap-2">
							<Send className="h-4 w-4" />
							Platform Transfers
						</TabsTrigger>
					</TabsList>
					<TabsContent value="transactions" className="space-y-4">
						<Card className="shadow-2xl space-y-4 p-4 border-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-xl">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="h-5 w-5 text-emerald-600" />
									Credit Transactions
									<Badge variant="secondary" className="ml-auto">
										{transactions.length}
									</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{
									transactions.length === 0 ? (
										<div className="text-center py-8">
											<Receipt className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
											<p className="text-neutral-600 dark:text-neutral-400">
												No transactions found. Start by purchasing some credits!
											</p>
											<Button asChild className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600">
												<Link href="/purchase">Buy Credits</Link>
											</Button>
										</div>
									) : (
										<div className="space-y-3">
											{
												transactions.map((transaction, index) => (
													<motion.div
														key={transaction.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.1 }}
														className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800"
													>
														<div className="flex items-center gap-4">
															{getTransactionIcon(transaction.type)}
															<div>
																<p className="font-medium text-slate-900 dark:text-white">
																	{transaction.description}
																</p>
																<div className="flex items-center gap-2 mt-1">
																	<Calendar className="h-3 w-3 text-slate-500" />
																	<span className="text-sm text-slate-500">
																		{formatDate(transaction.createdAt)}
																	</span>
																</div>
															</div>
														</div>
														<div className="text-right">
															<div className="flex items-center gap-2">
																<span className={`font-semibold ${transaction.type === 'PURCHASE' || transaction.type === 'BONUS' || transaction.type === 'REWARD'
																	? 'text-green-600'
																	: 'text-red-600'
																	}`}>
																	{transaction.type === 'PURCHASE' || transaction.type === 'BONUS' || transaction.type === 'REWARD' ? '+' : '-'}
																	{transaction.amount} credits
																</span>
																<Badge className={getTransactionColor(transaction.type)}>
																	{transaction.type}
																</Badge>
															</div>
															{
																transaction.currency !== 'NA' && (
																	<p className="text-sm text-slate-500 mt-1">
																		{transaction.currency}
																	</p>
																)
															}
														</div>
													</motion.div>
												))
											}
										</div>
									)
								}
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="transfers" className="space-y-4">
						<Card className="shadow-2xl p-4 border-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-xl">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Send className="h-5 w-5 text-teal-600" />
									Platform Transfers
									<Badge variant="secondary" className="ml-auto">
										{transfers.length}
									</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{
									transfers.length === 0 ? (
										<div className="text-center py-8">
											<Send className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
											<p className="text-neutral-600 dark:text-neutral-400">
												No transfers found. Credits transferred to other platforms will appear here.
											</p>
											<p className="text-sm text-neutral-500 mt-2">
												Transfers are initiated from external platforms like TrueFool.
											</p>
										</div>
									) : (
										<div className="space-y-3">
											{
												transfers.map((transfer, index) => (
													<motion.div
														key={transfer.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.1 }}
														className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
													>
														<div className="flex items-center gap-4">
															<div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
																<ExternalLink className="h-4 w-4 text-teal-600 dark:text-teal-400" />
															</div>
															<div>
																<p className="font-medium text-slate-900 dark:text-white">
																	Transfer to {transfer.destinationPlatform}
																</p>
																<div className="flex items-center gap-4 mt-1">
																	<div className="flex items-center gap-1">
																		<Calendar className="h-3 w-3 text-slate-500" />
																		<span className="text-sm text-slate-500">
																			{formatDate(transfer.createdAt)}
																		</span>
																	</div>
																	<div className="flex items-center gap-1">
																		<Clock className="h-3 w-3 text-slate-500" />
																		<span className="text-sm text-slate-500 font-mono">
																			{transfer.transferId.slice(0, 8)}...
																		</span>
																	</div>
																</div>
															</div>
														</div>
														<div className="text-right">
															<div className="flex items-center gap-2">
																<span className="font-semibold text-red-600">
																	-{transfer.creditsTransferred} credits
																</span>
																<Badge className={getStatusColor(transfer.status)}>
																	{transfer.status}
																</Badge>
															</div>
															<p className="text-sm text-slate-500 mt-1 capitalize">
																{transfer.destinationPlatform}
															</p>
														</div>
													</motion.div>
												))
											}
										</div>
									)
								}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
} 