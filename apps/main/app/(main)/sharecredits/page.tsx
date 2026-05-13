"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, ArrowRight, History, UserX, Loader2, Send
} from "lucide-react"
import { Input } from "@repo/ui/components/ui/input"
import { Button } from "@repo/ui/components/ui/button"
import {
    Card, CardContent
} from "@repo/ui/components/ui/card"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/app/store/useUserStore"
import BenefitsSection from "./_components/benefits-section"
import UserCard from "./_components/usercard"
import TransferDialog from "./_components/transfer-dialog"
import SmoothScroll from "@/components/smoothscroll"
import { searchUsers } from "@/actions/(main)/user/user.action"
import { getTransferHistory } from "@/actions/(main)/subscription/credits.action"
import { Badge } from "@repo/ui/components/ui/badge"

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400 mb-3" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Searching the directory...</p>
    </div>
)

const NoUserFound = ({ query }: { query: string }) => (
    <motion.div
        className="flex flex-col items-center justify-center py-12 text-center bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <UserX className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="text-base font-medium text-neutral-900 dark:text-white mb-1">No user found</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
            We couldn&apos;t find anyone matching &quot;{query}&quot;. Try a different username.
        </p>
    </motion.div>
)

interface SearchResult {
    id: string | null
    username: string | null
    name: string | null
    avatar: string | null
    credits?: number | null
}

interface TransferHistoryEntry {
    type: 'sent' | 'received'
    amount: number
    createdAt: Date
    recipientName?: string | null
    senderName?: string | null
}

export default function CreditTransferPage() {
    const router = useRouter()
    const { user, fetchUser, handleCreditTransfer } = useUserStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null)
    const [creditAmount, setCreditAmount] = useState(20)
    const [showDialog, setShowDialog] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [transferHistory, setTransferHistory] = useState<TransferHistoryEntry[]>([])
    const [hasSearched, setHasSearched] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return
            try {
                const history = await getTransferHistory(user.id)
                setTransferHistory(history as TransferHistoryEntry[])
            } catch (err) {
                console.error("Failed to load history", err)
            }
        }
        fetchHistory()
    }, [user?.id])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        setNoResults(false)
        setSearchResults([])
        setHasSearched(true)

        try {
            const results = await searchUsers(searchQuery)

            // Filter out self
            const filteredResults = results
                .filter(u => u.id !== user?.id)
                .map(u => ({
                    id: u.id,
                    username: u.username,
                    name: u.name,
                    avatar: u.image || "/placeholder.svg",
                    credits: u.credits
                }))
            setSearchResults(filteredResults)
            setNoResults(filteredResults.length === 0)
        } catch (err) {
            console.error(err)
        } finally {
            setIsSearching(false)
        }
    }

    const handleCreditChange = (amount: number) => {
        const newAmount = Math.max(20, amount)
        const maxCredits = user?.credits || 1000
        setCreditAmount(Math.min(newAmount, maxCredits))
    }

    return (
        <SmoothScroll>
            <div className="min-h-screen bg-white dark:bg-neutral-950 relative font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800">
                {/* Subtle grid background */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Hero Section */}
                <section className="relative pt-24 pb-20 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col items-center text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="w-full"
                            >
                                <Badge
                                    variant="outline"
                                    className="mb-6 px-4 py-1.5 rounded-full text-xs font-medium border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
                                >
                                    <Send className="w-3 h-3 mr-2" />
                                    Credit Transfer
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white mb-5">
                                    Share the wealth.
                                </h1>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed font-light">
                                    Transfer credits to friends and colleagues instantly.
                                    Enable them to unlock premium features, AI tools, and certifications.
                                </p>
                            </motion.div>

                            {/* Search Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="w-full max-w-2xl"
                            >
                                <div className="bg-white dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                    <form onSubmit={handleSearch} className="relative flex items-center">
                                        <Search className="absolute left-4 h-4 w-4 text-neutral-400 flex-shrink-0" />
                                        <Input
                                            type="text"
                                            placeholder="Search by username (e.g. 'johndoe')..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-12 pl-11 pr-28 bg-transparent border-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                                        />
                                        <div className="absolute right-2">
                                            <Button
                                                type="submit"
                                                disabled={isSearching}
                                                className="h-9 px-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-all font-medium rounded-lg text-sm"
                                            >
                                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>

                                {/* Balance display */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    <span>Your Balance:</span>
                                    <span className="font-bold font-mono text-neutral-900 dark:text-white">
                                        {user?.credits ?? 0} Credits
                                    </span>
                                    <button
                                        onClick={() => router.push("/purchase")}
                                        className="ml-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:underline flex items-center gap-1 text-sm transition-colors"
                                    >
                                        Top up <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Search Results */}
                        <AnimatePresence>
                            {hasSearched && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="max-w-4xl mx-auto mt-6"
                                >
                                    {isSearching ? (
                                        <LoadingSpinner />
                                    ) : noResults ? (
                                        <NoUserFound query={searchQuery} />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {searchResults.map((result, index) => (
                                                <motion.div
                                                    key={result.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.08 }}
                                                >
                                                    <UserCard
                                                        user={result}
                                                        creditAmount={creditAmount}
                                                        onCreditChange={handleCreditChange}
                                                        currentUserCredits={user?.credits || 0}
                                                        onTransfer={() => {
                                                            setSelectedUser(result)
                                                            setShowDialog(true)
                                                        }}
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Benefits Section */}
                <div className="relative z-10 bg-neutral-50 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
                    <BenefitsSection />
                </div>

                {/* Transfer History */}
                <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-neutral-400" />
                                Transfer History
                            </h2>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-light text-sm">
                                Keep track of your generosity (and your earnings).
                            </p>
                        </div>
                    </div>

                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-950 overflow-hidden rounded-xl">
                        <CardContent className="p-0">
                            {transferHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                    <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-center mb-5">
                                        <History className="w-6 h-6 text-neutral-400" />
                                    </div>
                                    <p className="text-neutral-900 dark:text-white font-medium mb-1">No transactions yet</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                                        Transfers you send or receive will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {transferHistory.map((transfer, index) => (
                                        <div
                                            key={index}
                                            className="px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                                                    transfer.type === "sent"
                                                        ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                                        : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                                }`}>
                                                    {transfer.type === "sent"
                                                        ? <ArrowRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400 -rotate-45" />
                                                        : <ArrowRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400 rotate-135" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                        {transfer.type === "sent"
                                                            ? `Sent to ${transfer.recipientName || "Unknown User"}`
                                                            : `Received from ${transfer.senderName || "Unknown User"}`
                                                        }
                                                    </p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                                                        {new Date(transfer.createdAt).toLocaleDateString(undefined, {
                                                            year: 'numeric', month: 'short', day: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`font-mono font-bold text-sm flex-shrink-0 ${
                                                transfer.type === "sent"
                                                    ? "text-neutral-500 dark:text-neutral-400"
                                                    : "text-neutral-900 dark:text-white"
                                            }`}>
                                                {transfer.type === "sent" ? "-" : "+"}{transfer.amount} Credits
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Transfer Dialog */}
                {showDialog && selectedUser && user && (
                    <TransferDialog
                        open={showDialog}
                        onClose={() => setShowDialog(false)}
                        sender={{ name: user.name || "You", image: user.image || "/placeholder.svg" }}
                        recipient={{ name: selectedUser.name || selectedUser.username || 'Unknown', image: selectedUser.avatar || "/placeholder.svg" }}
                        creditAmount={creditAmount}
                        onTransfer={() => handleCreditTransfer(selectedUser.id!, creditAmount)}
                    />
                )}
            </div>
        </SmoothScroll>
    )
}
