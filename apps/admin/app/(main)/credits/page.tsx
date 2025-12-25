"use client"

import { useState } from "react"
import {
    CreditCard, Search, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle,
    ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@repo/ui/lib/utils"
import Link from "next/link"
import { Input } from "@repo/ui/components/ui/input"
import { Select, SelectItem } from "@repo/ui/components/ui/select"

interface Transaction {
    id: string
    userId: string
    userName: string
    userEmail: string
    type: "PURCHASE" | "SPEND" | "BONUS" | "REWARD"
    amount: number
    description: string
    createdAt: string
}

// Mock data generator functions
const getRandomAmount = () => {
    const amounts = [100, 250, 500, 1000, -50, -100, -200]
    return amounts[Math.floor(Math.random() * amounts.length)] ?? 100
}

const getRandomDescription = () => {
    const descriptions = [
        "Credit package purchase",
        "Mock interview session",
        "Project completion bonus",
        "Referral reward",
        "Assessment unlock",
        "Daily login bonus"
    ]
    return descriptions[Math.floor(Math.random() * descriptions.length)] ?? "Transaction"
}

const getRandomType = (): Transaction["type"] => {
    const types: Transaction["type"][] = ["PURCHASE", "SPEND", "BONUS", "REWARD"]
    return types[Math.floor(Math.random() * types.length)] ?? "PURCHASE"
}

const mockTransactions: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
    id: `txn-${i + 1}`,
    userId: `user-${Math.floor(Math.random() * 100)}`,
    userName: `User ${Math.floor(Math.random() * 100)}`,
    userEmail: `user${Math.floor(Math.random() * 100)}@example.com`,
    type: getRandomType(),
    amount: getRandomAmount(),
    description: getRandomDescription(),
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
}))

interface CreditRequest {
    id: string
    userId: string
    userName: string
    userEmail: string
    requestedCredits: number
    linkedinPostUrl: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    createdAt: string
}

const getRandomRequestedCredits = () => {
    const amounts = [300, 500, 750, 1000]
    return amounts[Math.floor(Math.random() * amounts.length)] ?? 500
}

const mockRequests: CreditRequest[] = Array.from({ length: 10 }, (_, i) => ({
    id: `req-${i + 1}`,
    userId: `user-${Math.floor(Math.random() * 100)}`,
    userName: `User ${Math.floor(Math.random() * 100)}`,
    userEmail: `user${Math.floor(Math.random() * 100)}@example.com`,
    requestedCredits: getRandomRequestedCredits(),
    linkedinPostUrl: "https://linkedin.com/posts/...",
    status: "PENDING" as const,
    createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
}))

type Tab = "overview" | "transactions" | "requests";
export default function CreditsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("overview")
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<"all" | Transaction["type"]>("all")

    const stats = {
        totalInCirculation: "1,245,678",
        purchasedThisMonth: "125,000",
        spentThisMonth: "89,500",
        pendingRequests: mockRequests.filter(r => r.status === "PENDING").length
    }

    const filteredTransactions = mockTransactions.filter(txn => {
        const matchesSearch = txn.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = typeFilter === "all" || txn.type === typeFilter
        return matchesSearch && matchesType
    })

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                    <CreditCard className="w-7 h-7" />
                    Credits Management
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    Monitor and manage credit transactions across the platform
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalInCirculation}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Total in Circulation</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.purchasedThisMonth}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Purchased This Month</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <ArrowDownRight className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.spentThisMonth}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Spent This Month</p>
                </div>
                <Link href="/credits/requests">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:border-amber-500 dark:hover:border-amber-500 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.pendingRequests}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            Pending Requests
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </p>
                    </div>
                </Link>
            </div>
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-6">
                {
                    ["overview", "transactions", "requests"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as "overview" || "transactions" || "requests")}
                            className={cn(
                                "px-6 py-3 text-sm font-medium transition-colors relative",
                                activeTab === tab
                                    ? "text-neutral-900 dark:text-white"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                            )}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {
                                activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"
                                    />
                                )
                            }
                        </button>
                    ))
                }
            </div>
            {
                activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Recent Transactions</h3>
                                <Link href="/credits/transactions" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                                    View all
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {
                                    mockTransactions.slice(0, 5).map((txn) => (
                                        <div key={txn.id} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                                    txn.amount > 0
                                                        ? "bg-emerald-50 dark:bg-emerald-500/10"
                                                        : "bg-red-50 dark:bg-red-500/10"
                                                )}>
                                                    {txn.amount > 0
                                                        ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                                        : <ArrowDownRight className="w-4 h-4 text-red-500" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{txn.userName}</p>
                                                    <p className="text-xs text-neutral-500">{txn.description}</p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "font-semibold",
                                                txn.amount > 0 ? "text-emerald-600" : "text-red-600"
                                            )}>
                                                {txn.amount > 0 ? "+" : ""}{txn.amount}
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Pending Requests</h3>
                                <Link href="/credits/requests" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                                    View all
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {
                                    mockRequests.slice(0, 5).map((req) => (
                                        <div key={req.id} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white">{req.userName}</p>
                                                <p className="text-xs text-neutral-500">{req.userEmail}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-neutral-900 dark:text-white">{req.requestedCredits}</span>
                                                <div className="flex gap-1">
                                                    <button className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )
            }
            {
                activeTab === "transactions" && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by user..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            </div>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) => setTypeFilter(value as Transaction["type"])}
                            >
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="PURCHASE">Purchase</SelectItem>
                                <SelectItem value="SPEND">Spend</SelectItem>
                                <SelectItem value="BONUS">Bonus</SelectItem>
                                <SelectItem value="REWARD">Reward</SelectItem>
                            </Select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">User</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Type</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Amount</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Description</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        filteredTransactions.map((txn) => (
                                            <tr
                                                key={txn.id}
                                                className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-neutral-900 dark:text-white">{txn.userName}</p>
                                                        <p className="text-sm text-neutral-500">{txn.userEmail}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                                        {
                                                            "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400": txn.type === "PURCHASE",
                                                            "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400": txn.type === "SPEND",
                                                            "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400": txn.type === "BONUS",
                                                            "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400": txn.type === "REWARD",
                                                        }
                                                    )}>
                                                        {txn.type}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={cn(
                                                        "font-semibold",
                                                        txn.amount > 0 ? "text-emerald-600" : "text-red-600"
                                                    )}>
                                                        {txn.amount > 0 ? "+" : ""}{txn.amount}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400">
                                                    {txn.description}
                                                </td>
                                                <td className="p-4 text-sm text-neutral-500">
                                                    {new Date(txn.createdAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
            {
                activeTab === "requests" && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">User</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Requested</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">LinkedIn Post</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Date</th>
                                        <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        mockRequests.map((req) => (
                                            <tr
                                                key={req.id}
                                                className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-neutral-900 dark:text-white">{req.userName}</p>
                                                        <p className="text-sm text-neutral-500">{req.userEmail}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                                        {req.requestedCredits} credits
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <Link
                                                        href={req.linkedinPostUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2"
                                                    >
                                                        View Post
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-sm text-neutral-500">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <button className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-sm font-medium transition-colors flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-medium transition-colors flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div>
    )
}