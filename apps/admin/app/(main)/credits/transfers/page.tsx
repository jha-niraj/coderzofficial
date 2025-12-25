"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Search, ArrowRightLeft, Loader2, Plus
} from "lucide-react"
import {
    getCreditTransfers, transferCredits
} from "@/actions/credit.action"
import { toast } from "@repo/ui/components/ui/sonner"
import { format } from "date-fns"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@repo/ui/components/ui/sheet"
import { Button } from "@repo/ui/components/ui/button"

interface Transfer {
    id: string,
    amount: string,
    createdAt: string,
    description: string,
    sender: {
        id: string,
        name: string,
        email: string,
        image?: string
    },
    receiver: {
        id: string,
        name: string,
        email: string,
        image?: string
    }
}

export default function CreditTransfersPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [transferData, setTransferData] = useState({
        fromUserId: "",
        toUserId: "",
        amount: 0,
        description: ""
    })
    const [submitting, setSubmitting] = useState(false)

    const fetchTransfers = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getCreditTransfers({}, { page, limit: 20 })

            if (result.success && result.data) {
                setTransfers(result.data.transfers)
                setTotalPages(result.data.pages || 1)
            } else {
                toast.error(result.error || "Failed to fetch transfers")
            }
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }, [page]);

    useEffect(() => {
        fetchTransfers()
    }, [page, searchTerm, fetchTransfers])

    async function handleTransfer() {
        if (!transferData.fromUserId || !transferData.toUserId || transferData.amount <= 0) {
            toast.error("Please fill all required fields")
            return
        }

        setSubmitting(true)
        try {
            const result = await transferCredits(
                transferData.fromUserId,
                transferData.toUserId,
                transferData.amount,
                transferData.description
            )

            if (result.success) {
                toast.success("Credits transferred successfully")
                setShowTransferModal(false)
                setTransferData({ fromUserId: "", toUserId: "", amount: 0, description: "" })
                fetchTransfers()
            } else {
                toast.error(result.error || "Failed to transfer credits")
            }
        } catch (error) {
            console.error("Transfer error:", error)
            toast.error("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <ArrowRightLeft className="w-7 h-7" />
                        Credit Transfers
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Transfer credits between users
                    </p>
                </div>
                <button
                    onClick={() => setShowTransferModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Transfer
                </button>
            </div>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                    type="text"
                    placeholder="Search by user email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
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
                                                From
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">

                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                To
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                                Amount
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
                                            transfers.map((transfer) => (
                                                <tr key={transfer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                                                {transfer.sender?.name?.charAt(0) || "U"}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                    {transfer.sender?.name || "Unknown"}
                                                                </div>
                                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                    {transfer.sender?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <ArrowRightLeft className="w-5 h-5 text-neutral-400 mx-auto" />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                                                                {transfer.receiver?.name?.charAt(0) || "U"}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                    {transfer.receiver?.name || "Unknown"}
                                                                </div>
                                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                    {transfer.receiver?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                            {transfer.amount} credits
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                                        {format(new Date(transfer.createdAt), "MMM dd, yyyy HH:mm")}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                                                        {transfer.description || "N/A"}
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
            <Sheet open={showTransferModal} onOpenChange={setShowTransferModal}>
                <SheetContent side="right" className="max-w-md w-full">
                    <SheetHeader>
                        <SheetTitle>Transfer Credits</SheetTitle>
                        <SheetDescription>Transfer credits between users</SheetDescription>
                    </SheetHeader>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            handleTransfer();
                        }}
                        className="space-y-4 mt-4"
                    >
                        <div>
                            <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                From User ID
                            </Label>
                            <Input
                                type="text"
                                value={transferData.fromUserId}
                                onChange={e => setTransferData({ ...transferData, fromUserId: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter user ID"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                To User ID
                            </Label>
                            <Input
                                type="text"
                                value={transferData.toUserId}
                                onChange={e => setTransferData({ ...transferData, toUserId: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter user ID"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Amount
                            </Label>
                            <Input
                                type="number"
                                value={transferData.amount}
                                onChange={e => setTransferData({ ...transferData, amount: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Description (optional)
                            </Label>
                            <Textarea
                                value={transferData.description}
                                onChange={e => setTransferData({ ...transferData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows={3}
                                placeholder="Enter description"
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowTransferModal(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={submitting}
                            >
                                {submitting ? "Transferring..." : "Transfer"}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    )
}