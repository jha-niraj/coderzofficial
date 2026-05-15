"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    GraduationCap, Search, CheckCircle2, Clock, XCircle,
    AlertCircle, ArrowRight, Building2, Mail, Loader2
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import Link from "next/link"

type VerificationStatus = "none" | "pending" | "verified" | "rejected"

interface UniversityInfo {
    id: string
    name: string
    logoUrl?: string
    isPartner: boolean
}

export default function UniversityVerificationPage() {
    const [verificationStatus] = useState<VerificationStatus>("none")
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<UniversityInfo[]>([])
    const [selectedUniversity, setSelectedUniversity] = useState<UniversityInfo | null>(null)
    const [enrollmentId, setEnrollmentId] = useState("")
    const [universityEmail, setUniversityEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState<"search" | "details" | "submitted">("search")

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        
        setIsSearching(true)
        // TODO: Implement actual search
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for now
        setSearchResults([
            { id: "1", name: "Delhi Technical University", isPartner: true },
            { id: "2", name: "Indian Institute of Technology Delhi", isPartner: true },
            { id: "3", name: "Netaji Subhas University of Technology", isPartner: false },
        ].filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())))
        
        setIsSearching(false)
    }

    const handleSelectUniversity = (uni: UniversityInfo) => {
        setSelectedUniversity(uni)
        setStep("details")
    }

    const handleSubmitVerification = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUniversity || !enrollmentId || !universityEmail) return

        setIsSubmitting(true)
        // TODO: Implement actual verification submission
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSubmitting(false)
        setStep("submitted")
    }

    // Render verification status badge
    const renderStatusBadge = () => {
        switch (verificationStatus) {
            case "pending":
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Verification Pending
                    </div>
                )
            case "verified":
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified Student
                    </div>
                )
            case "rejected":
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Verification Rejected
                    </div>
                )
            default:
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Not Verified
                    </div>
                )
        }
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            University Verification
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Connect your university to get exclusive benefits and credits
                        </p>
                    </div>
                    {renderStatusBadge()}
                </div>
            </div>

            {/* Benefits Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-white/10">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-2">Benefits of University Verification</h2>
                        <ul className="space-y-2 text-violet-100 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                Receive credits from your university for platform access
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                Access university-exclusive assignments and mock interviews
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                Get featured in university placement drives
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                Connect with alumni and recruiters visiting your campus
                            </li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {step === "search" && (
                    <motion.div
                        key="search"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                            Find Your University
                        </h2>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search for your university..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="h-12 rounded-xl"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching || !searchQuery.trim()}
                                className="h-12 px-6 rounded-xl bg-neutral-900 dark:bg-white dark:text-black"
                            >
                                {isSearching ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Search
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <p className="text-sm text-neutral-500">
                                    {searchResults.length} universities found
                                </p>
                                {searchResults.map((uni) => (
                                    <motion.div
                                        key={uni.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors cursor-pointer"
                                        onClick={() => handleSelectUniversity(uni)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">
                                                        {uni.name}
                                                    </p>
                                                    {uni.isPartner && (
                                                        <span className="text-xs text-green-600 dark:text-green-400">
                                                            ✓ Partner University
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-neutral-400" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Not Found Message */}
                        {searchResults.length === 0 && searchQuery && !isSearching && (
                            <div className="mt-6 text-center py-8">
                                <AlertCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                                <p className="text-neutral-500">
                                    No universities found matching &quot;{searchQuery}&quot;
                                </p>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Your university might not be a partner yet.{" "}
                                    <Link href="/contact" className="text-violet-600 hover:underline">
                                        Request to add your university
                                    </Link>
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {step === "details" && selectedUniversity && (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                    >
                        <button
                            onClick={() => setStep("search")}
                            className="text-sm text-violet-600 hover:underline mb-4 flex items-center gap-1"
                        >
                            ← Back to search
                        </button>

                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="w-14 h-14 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    {selectedUniversity.name}
                                </h2>
                                {selectedUniversity.isPartner && (
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                        ✓ Partner University - Credits will be allocated by university
                                    </span>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmitVerification} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="enrollmentId" className="text-sm font-medium">
                                    Enrollment / Roll Number
                                </Label>
                                <Input
                                    id="enrollmentId"
                                    placeholder="e.g., 2021BCS001"
                                    value={enrollmentId}
                                    onChange={(e) => setEnrollmentId(e.target.value)}
                                    required
                                    className="h-12 rounded-xl"
                                />
                                <p className="text-xs text-neutral-500">
                                    Enter your university enrollment number exactly as it appears on your ID card
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="universityEmail" className="text-sm font-medium">
                                    University Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        id="universityEmail"
                                        type="email"
                                        placeholder="yourname@university.edu"
                                        value={universityEmail}
                                        onChange={(e) => setUniversityEmail(e.target.value)}
                                        required
                                        className="h-12 pl-11 rounded-xl"
                                    />
                                </div>
                                <p className="text-xs text-neutral-500">
                                    A verification email will be sent to this address
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !enrollmentId || !universityEmail}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Verification Request
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {step === "submitted" && (
                    <motion.div
                        key="submitted"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                            Verification Request Submitted!
                        </h2>
                        <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                            We&apos;ve sent a verification email to <strong>{universityEmail}</strong>.
                            Please click the link in the email to verify your university affiliation.
                        </p>
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-left max-w-md mx-auto">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        What happens next?
                                    </p>
                                    <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                                        <li>1. Verify your email (check spam folder)</li>
                                        <li>2. Your university admin will review your request</li>
                                        <li>3. Once approved, credits will be allocated to your account</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link href="/home">
                                <Button variant="outline" className="rounded-xl">
                                    Return to Home
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}