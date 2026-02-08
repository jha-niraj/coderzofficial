"use client"

import { motion } from "framer-motion"
import {
    ArrowRight, DollarSign, Receipt, TrendingUp,
    AlertCircle, Coins, BarChart3
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

interface FinanceOfficerDashboardProps {
    userName: string
    stats?: {
        currentBalance: number
        totalSpent: number
        pendingInvoices: number
        monthlySpend: number
    }
}

interface StatCardProps {
    title: string
    value: string | number
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    icon: React.ReactNode
    href: string
}

const StatCard = ({ title, value, change, changeType = "neutral", icon, href }: StatCardProps) => (
    <Link href={href}>
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-green-300 dark:hover:border-green-700 transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                    {icon}
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-sm text-neutral-500">{title}</p>
            </div>
            {change && (
                <div className={`mt-3 text-xs font-medium ${
                    changeType === "positive" ? "text-green-600 dark:text-green-400" :
                    changeType === "negative" ? "text-red-600 dark:text-red-400" :
                    "text-neutral-500"
                }`}>
                    {change}
                </div>
            )}
        </motion.div>
    </Link>
)

export function FinanceOfficerDashboard({ userName, stats }: FinanceOfficerDashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const dashboardStats = [
        { 
            title: "Credit Balance", 
            value: stats?.currentBalance || 0, 
            change: "Available credits",
            icon: <Coins className="w-5 h-5 text-green-600" />, 
            href: "/billing" 
        },
        { 
            title: "Total Spent", 
            value: stats?.totalSpent ? formatCurrency(stats.totalSpent) : "₹0", 
            change: "All time spending",
            icon: <DollarSign className="w-5 h-5 text-green-600" />, 
            href: "/billing/history" 
        },
        { 
            title: "Monthly Spend", 
            value: stats?.monthlySpend ? formatCurrency(stats.monthlySpend) : "₹0", 
            change: "This month",
            icon: <TrendingUp className="w-5 h-5 text-green-600" />, 
            href: "/billing/analytics" 
        },
        { 
            title: "Pending Invoices", 
            value: stats?.pendingInvoices || 0, 
            change: stats?.pendingInvoices ? "Needs attention" : "All clear",
            changeType: stats?.pendingInvoices ? "negative" as const : "positive" as const,
            icon: <Receipt className="w-5 h-5 text-green-600" />, 
            href: "/billing/invoices" 
        },
    ]

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                                Finance Officer
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Manage university billing and credit purchases.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/billing/invoices">
                            <Button variant="outline" className="rounded-xl">
                                <Receipt className="w-4 h-4 mr-2" />
                                View Invoices
                            </Button>
                        </Link>
                        <Link href="/billing">
                            <Button className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                                <Coins className="w-4 h-4 mr-2" />
                                Buy Credits
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                {dashboardStats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Transactions</h2>
                        <Link href="/billing/history">
                            <Button variant="ghost" size="sm" className="text-xs">
                                View All <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">No transactions yet</h3>
                        <p className="text-sm text-neutral-500 mb-4 max-w-sm mx-auto">
                            Purchase credits to see transaction history.
                        </p>
                        <Link href="/billing">
                            <Button variant="outline" size="sm" className="rounded-xl">
                                <Coins className="w-4 h-4 mr-2" />
                                Buy Credits
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {/* Financial Summary */}
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">Financial Summary</h3>
                        <p className="text-green-200 text-sm mb-4">
                            Current billing period.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-green-200">Plan</span>
                                <span className="font-bold">Starter</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-green-200">Credits Remaining</span>
                                <span className="font-bold">{stats?.currentBalance || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-green-200">Next Billing</span>
                                <span className="font-bold">-</span>
                            </div>
                        </div>
                    </div>

                    {/* Reports */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <BarChart3 className="w-4 h-4 text-green-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Reports</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            Generate financial reports and usage analytics.
                        </p>
                        <Link href="/billing/analytics">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                View Analytics
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
