"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    GraduationCap, Building, Search, AlertCircle, CheckCircle,
    Clock, Hash, Loader2
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    searchUniversityByCode, requestUniversityVerification,
    getStudentUniversityLink
} from "@/actions/university/university.action"
import Image from "next/image"

type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED"

interface UniversityLink {
    id: string
    verificationStatus: VerificationStatus
    rollNumber: string | null
    createdAt: Date
    university: {
        id: string
        name: string
        logoUrl: string | null
        code: string
    }
}

interface University {
    id: string
    name: string
    logoUrl: string | null
    code: string
    type: string | null
}

export default function UniVerifyPage() {
    const router = useRouter()
    const [existingLink, setExistingLink] = useState<UniversityLink | null>(null)
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [universityCode, setUniversityCode] = useState("")
    const [rollNumber, setRollNumber] = useState("")
    const [foundUniversity, setFoundUniversity] = useState<University | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const checkExistingLink = async () => {
            try {
                const response = await getStudentUniversityLink()
                if (response.success && response.data) {
                    setExistingLink(response.data as UniversityLink)
                }
            } catch (error) {
                console.error("Error checking university link:", error)
            } finally {
                setLoading(false)
            }
        }

        checkExistingLink()
    }, [])

    const handleSearchUniversity = async () => {
        if (!universityCode.trim()) {
            setError("Please enter a university code")
            return
        }

        setError(null)
        setSearching(true)
        setFoundUniversity(null)

        try {
            const response = await searchUniversityByCode(universityCode.trim().toUpperCase())
            if (response.success && response.data) {
                setFoundUniversity(response.data as University)
            } else {
                setError("University not found. Please check the code and try again.")
            }
        } catch {
            setError("Failed to search for university. Please try again.")
        } finally {
            setSearching(false)
        }
    }

    const handleSubmitVerification = async () => {
        if (!foundUniversity) {
            setError("Please search and select a university first")
            return
        }

        if (!rollNumber.trim()) {
            setError("Please enter your roll number / student ID")
            return
        }

        setError(null)
        setSubmitting(true)

        try {
            const response = await requestUniversityVerification({
                universityId: foundUniversity.id,
                rollNumber: rollNumber.trim()
            })

            if (response.success) {
                setSuccess(true)
                setTimeout(() => {
                    router.refresh()
                }, 2000)
            } else {
                setError(response.message || "Failed to submit verification request")
            }
        } catch {
            setError("Failed to submit verification request. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="animate-pulse text-center">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-violet-500" />
                    <p className="text-neutral-500">Loading...</p>
                </div>
            </div>
        )
    }

    // Show existing verification status
    if (existingLink) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8">
                        <div className="text-center mb-8">
                            {
                                existingLink.verificationStatus === "PENDING" && (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                                            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                            Verification Pending
                                        </h1>
                                        <p className="text-neutral-500">
                                            Your verification request is being reviewed by the university.
                                        </p>
                                    </>
                                )
                            }
                            {
                                existingLink.verificationStatus === "VERIFIED" && (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                            Verified Student
                                        </h1>
                                        <p className="text-neutral-500">
                                            You have been verified as a student.
                                        </p>
                                    </>
                                )
                            }
                            {
                                existingLink.verificationStatus === "REJECTED" && (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                            Verification Rejected
                                        </h1>
                                        <p className="text-neutral-500">
                                            Your verification was rejected. Please contact your university.
                                        </p>
                                    </>
                                )
                            }
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Building className="w-4 h-4 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500">University</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {existingLink.university.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Hash className="w-4 h-4 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500">Roll Number</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {existingLink.rollNumber || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-neutral-400" />
                                <div>
                                    <p className="text-xs text-neutral-500">Requested On</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {new Date(existingLink.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {
                            existingLink.verificationStatus === "VERIFIED" && (
                                <Button
                                    onClick={() => router.push("/uni")}
                                    className="w-full mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                                >
                                    Go to University Portal
                                </Button>
                            )
                        }
                    </div>
                </motion.div>
            </div>
        )
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                        Verification Request Submitted!
                    </h1>
                    <p className="text-neutral-500">
                        Your request has been sent to the university for review. You&apos;ll be notified once it&apos;s approved.
                    </p>
                </motion.div>
            </div>
        )
    }

    // Verification form
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                        Link Your University
                    </h1>
                    <p className="text-neutral-500">
                        Connect with your university to access exclusive features, credits, and opportunities.
                    </p>
                </div>
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <div className="mb-6">
                        <Label className="text-sm font-medium text-neutral-900 dark:text-white mb-2 block">
                            University Code
                        </Label>
                        <p className="text-xs text-neutral-500 mb-3">
                            Enter the unique code provided by your university
                        </p>
                        <div className="flex gap-2">
                            <Input
                                value={universityCode}
                                onChange={(e) => setUniversityCode(e.target.value.toUpperCase())}
                                placeholder="e.g., UNIV123"
                                className="flex-1 rounded-xl uppercase"
                                disabled={searching || !!foundUniversity}
                            />
                            {
                                !foundUniversity && (
                                    <Button
                                        onClick={handleSearchUniversity}
                                        disabled={searching || !universityCode.trim()}
                                        className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
                                    >
                                        {
                                            searching ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Search className="w-4 h-4" />
                                            )
                                        }
                                    </Button>
                                )
                            }
                        </div>
                    </div>

                    {
                        foundUniversity && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                                            {
                                                foundUniversity.logoUrl ? (
                                                    <Image
                                                        src={foundUniversity.logoUrl}
                                                        alt={foundUniversity.name}
                                                        className="w-8 h-8 rounded-lg object-contain"
                                                        fill
                                                    />
                                                ) : (
                                                    <Building className="w-5 h-5 text-violet-600" />
                                                )
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                {foundUniversity.name}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Code: {foundUniversity.code} • {foundUniversity.type}
                                            </p>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFoundUniversity(null)
                                        setUniversityCode("")
                                    }}
                                    className="mt-2 text-xs text-neutral-500"
                                >
                                    Search for a different university
                                </Button>
                            </motion.div>
                        )
                    }
                    {
                        foundUniversity && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <Label className="text-sm font-medium text-neutral-900 dark:text-white mb-2 block">
                                    Roll Number / Student ID
                                </Label>
                                <p className="text-xs text-neutral-500 mb-3">
                                    Enter your official roll number or student ID
                                </p>
                                <Input
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    placeholder="e.g., 2024CS001"
                                    className="rounded-xl"
                                    disabled={submitting}
                                />
                            </motion.div>
                        )
                    }

                    {
                        error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            >
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        foundUniversity && (
                            <Button
                                onClick={handleSubmitVerification}
                                disabled={submitting || !rollNumber.trim()}
                                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white h-12"
                            >
                                {
                                    submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <GraduationCap className="w-4 h-4 mr-2" />
                                            Request Verification
                                        </>
                                    )
                                }
                            </Button>
                        )
                    }
                </div>
                <p className="text-center text-xs text-neutral-500 mt-6">
                    Don&apos;t have a university code?{" "}
                    <Link href="#" className="text-violet-600 hover:underline">
                        Contact your university admin
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}