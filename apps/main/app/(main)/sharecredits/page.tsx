"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, ArrowRight, Sparkles, History, UserX, Loader2
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
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
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
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">No user found</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
            We couldn&apos;t find anyone matching &quot;{query}&quot;. Try a different username.
        </p>
    </motion.div>
)

export default function CreditTransferPage() {
    const router = useRouter()
    const { user, fetchUser, handleCreditTransfer } = useUserStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [creditAmount, setCreditAmount] = useState(20)
    const [showDialog, setShowDialog] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [transferHistory, setTransferHistory] = useState<any[]>([])
    const [hasSearched, setHasSearched] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return
            try {
                const history = await getTransferHistory(user.id)
                setTransferHistory(history)
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
                    credits: u.credits // Ensure backend returns this or handle gracefully
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
            <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900/30">
                <section className="relative pt-20 pb-32 overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
                        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent" />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col items-center text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full text-sm font-medium border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
                                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                                    Community Economy
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                                    Share the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Wealth</span>.
                                    <br />
                                    Fuel the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">Learning</span>.
                                </h1>
                                <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                                    Transfer credits to friends and colleagues instantly.
                                    Enable them to unlock premium features, AI tools, and certifications.
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="w-full max-w-2xl"
                            >
                                <div className="bg-white dark:bg-neutral-900 p-2 rounded-2xl shadow-2xl shadow-emerald-500/10 border border-neutral-200 dark:border-neutral-800">
                                    <form onSubmit={handleSearch} className="relative flex items-center">
                                        <Search className="absolute left-4 h-5 w-5 text-neutral-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by username (e.g. 'johndoe')..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-14 pl-12 pr-32 bg-transparent border-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                                        />
                                        <div className="absolute right-2 flex items-center gap-2">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={isSearching}
                                                className="h-10 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all font-medium rounded-xl"
                                            >
                                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    <span>Your Balance:</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-sm px-3 py-0.5">
                                        {user?.credits ?? 0} Credits
                                    </Badge>
                                    <button
                                        onClick={() => router.push("/purchase")}
                                        className="ml-2 text-emerald-600 dark:text-emerald-500 hover:underline flex items-center gap-1 font-medium"
                                    >
                                        Top up <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                        <AnimatePresence>
                            {
                            hasSearched && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="max-w-4xl mx-auto mt-8"
                                >
                                    {
                                    isSearching ? (
                                        <LoadingSpinner />
                                    ) : noResults ? (
                                        <NoUserFound query={searchQuery} />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {
                                            searchResults.map((result, index) => (
                                                <motion.div
                                                    key={result.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
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
                                            ))
                                            }
                                        </div>
                                    )
                                    }
                                </motion.div>
                            )
                            }
                        </AnimatePresence>
                    </div>
                </section>
                <div className="relative z-10 bg-neutral-50 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
                    <BenefitsSection />
                </div>
                <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <History className="w-6 h-6 text-emerald-500" />
                                Transaction History
                            </h2>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                                Keep track of your generosity (and your earnings).
                            </p>
                        </div>
                    </div>
                    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
                        <CardContent className="p-0">
                            {
                            transferHistory.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <History className="w-8 h-8 text-neutral-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No transactions yet</h3>
                                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                                        Transfers you send or receive will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {
                                    transferHistory.map((transfer, index) => (
                                        <div key={index} className="p-4 sm:p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-lg ${transfer.type === "sent"
                                                    ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                                                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                                    }`}>
                                                    {transfer.type === "sent" ? <ArrowRight className="w-4 h-4 -rotate-45" /> : <ArrowRight className="w-4 h-4 rotate-135" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                        {
                                                        transfer.type === "sent"
                                                            ? `Sent to ${transfer.recipientName || "Unknown User"}`
                                                            : `Received from ${transfer.senderName || "Unknown User"}`
                                                        }
                                                    </p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                        {
                                                        new Date(transfer.createdAt).toLocaleDateString(undefined, {
                                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`font-mono font-medium ${transfer.type === "sent"
                                                ? "text-neutral-900 dark:text-neutral-200"
                                                : "text-emerald-600 dark:text-emerald-400"
                                                }`}>
                                                {transfer.type === "sent" ? "-" : "+"}{transfer.amount} Credits
                                            </div>
                                        </div>
                                    ))
                                    }
                                </div>
                            )
                            }
                        </CardContent>
                    </Card>
                </section>
                {
                showDialog && selectedUser && user && (
                    <TransferDialog
                        open={showDialog}
                        onClose={() => setShowDialog(false)}
                        sender={{ name: user.name || "You", image: user.image || "/placeholder.svg" }}
                        recipient={{ name: selectedUser.name || selectedUser.username, image: selectedUser.avatar || "/placeholder.svg" }}
                        creditAmount={creditAmount}
                        onTransfer={() => handleCreditTransfer(selectedUser.id, creditAmount)}
                    />
                )
                }
            </div>
        </SmoothScroll>
    )
}