"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Search, CreditCard, Loader2, IndianRupee
} from "lucide-react"
import { getPayments } from "@/actions/main/credit.action"
import { toast } from "@repo/ui/components/ui/sonner"
import { format } from "date-fns"
import { PaymentStatus } from "@repo/db"

interface Payments {
    id: string,
    orderId: string,
    credits: string,
    amount: number,
    status: PaymentStatus,
    createdAt: string,
    user: {
        id: string,
        name: string,
        email: string,
    }
}

export default function CreditPaymentsPage() {
    const [payments, setPayments] = useState<Payments[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchPayments = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getPayments({ status: statusFilter || 'all' }, { page, limit: 20 })

            if (result.success && result.data) {
                setPayments(result.data.payments)
                setTotalPages(result.data.pages || 1)
            } else {
                toast.error(result.error || "Failed to fetch payments")
            }
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchPayments()
    }, [page, searchTerm, statusFilter, fetchPayments])

    function getStatusBadge(status: string) {
        const styles = {
            SUCCESS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            REFUNDED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        }
        return styles[status as keyof typeof styles] || styles.PENDING
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount / 100) // Assuming amount is in paise
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="w-7 h-7" />
                        Credit Payments
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        View all credit purchase transactions
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by user email or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">All Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                </select>
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
                                                Order ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Credits
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Payment Method
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {
                                            payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium">
                                                                {payment.user?.name?.charAt(0) || "U"}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                    {payment.user?.name || "Unknown"}
                                                                </div>
                                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                    {payment.user?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-mono text-neutral-900 dark:text-white">
                                                            {payment.orderId || payment.id.slice(0, 8)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1 text-sm font-semibold text-neutral-900 dark:text-white">
                                                            <IndianRupee className="w-3.5 h-3.5" />
                                                            {formatCurrency(payment.amount)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                            {payment.credits} credits
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(payment.status)}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300 capitalize">
                                                        {"RazorPay"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                                        {format(new Date(payment.createdAt), "MMM dd, yyyy HH:mm")}
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                            {
                                payments.length === 0 && (
                                    <div className="text-center py-12">
                                        <CreditCard className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                                        <p className="text-neutral-500 dark:text-neutral-400">No payments found</p>
                                    </div>
                                )
                            }
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