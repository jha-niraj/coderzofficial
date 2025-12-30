"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Search, Download, Loader2, DollarSign
} from "lucide-react"
import { getAllTransactions } from "@/actions/main/credit.action"
import { toast } from "@repo/ui/components/ui/sonner"
import { format } from "date-fns"
import { Input } from "@repo/ui/components/ui/input"
import { Select, SelectItem } from "@repo/ui/components/ui/select"
import { CreditType, PaymentStatus } from "@repo/prisma/client"

interface Transactions {
    id: string,
    userId: string,
    amount: number,
    createdAt: string,
    description: string,
    type: CreditType
    user: {
        id: string,
        name: string,
        email: string,
        image?: string
    }
    payment: {
        id: string,
        status: PaymentStatus
    }
}

export default function CreditTransactionsPage() {
    const [transactions, setTransactions] = useState<Transactions[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchTransactions = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getAllTransactions(
                {
                    type: typeFilter || "all",
                    // You can extend filters to include status/search in your action later
                },
                { page, limit: 20 }
            )

            if (result.success && result.data) {
                setTransactions(result.data.transactions)
                // result.data.pages is total pages
                setTotalPages(result.data.pages || 1)
            } else if (result.error) {
                toast.error(result.error)
            }
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }, [page, typeFilter]);

    useEffect(() => {
        fetchTransactions()
    }, [page, searchTerm, statusFilter, typeFilter, fetchTransactions])

    function getStatusBadge(status: string) {
        const styles = {
            COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            CANCELLED: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
        }
        return styles[status as keyof typeof styles] || styles.PENDING
    }

    function getTypeBadge(type: string) {
        const styles = {
            PURCHASE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            REWARD: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            REFUND: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            DEDUCTION: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        }
        return styles[type as keyof typeof styles] || styles.PURCHASE
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <DollarSign className="w-7 h-7" />
                        Credit Transactions
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        View and manage all credit transactions
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        type="text"
                        placeholder="Search by user email or transaction ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                >
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </Select>
                <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                >
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="PURCHASE">Purchase</SelectItem>
                    <SelectItem value="REWARD">Reward</SelectItem>
                    <SelectItem value="REFUND">Refund</SelectItem>
                    <SelectItem value="DEDUCTION">Deduction</SelectItem>
                </Select>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {
                    loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Description
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {
                                            transactions.map((transaction) => (
                                                <tr key={transaction.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                                                                {transaction.user?.name?.charAt(0) || "U"}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                    {transaction.user?.name || "Unknown"}
                                                                </div>
                                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                    {transaction.user?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(transaction.type)}`}>
                                                            {transaction.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`text-sm font-semibold ${transaction.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(transaction?.payment?.status)}`}>
                                                            {transaction?.payment?.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                                        {format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                                                        {transaction.description || "N/A"}
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                            {
                                totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
        </div>
    )
}