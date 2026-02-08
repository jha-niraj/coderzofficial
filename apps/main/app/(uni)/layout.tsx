'use client'

import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname, useRouter } from "next/navigation"
import UniSidebar from '@/components/common/unisidebar'
import {
    useSidebar, SidebarProvider
} from '@/components/common/sidebarprovider'
import { WifiOff, RotateCcw, GraduationCap, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { cn } from '@repo/ui/lib/utils'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { useSession } from '@repo/auth/client'
import { getStudentUniversityLink } from '@/actions/university/university.action'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'

interface LayoutProps {
    children: React.ReactNode
}

interface UniversityData {
    universityName: string
    credits: number
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

const UniContent = ({ children, universityData }: { children: React.ReactNode; universityData: UniversityData | null }) => {
    const { isCollapsed } = useSidebar()

    return (
        <>
            <UniSidebar 
                universityName={universityData?.universityName} 
                credits={universityData?.credits} 
            />
            <div className="flex flex-col flex-1 h-screen overflow-hidden bg-neutral-100 dark:bg-black transition-colors duration-300">
                <main className={cn(
                    "h-full relative transition-all duration-300 ease-in-out",
                    "ml-0",
                    isCollapsed ? "lg:ml-[70px]" : "lg:ml-[240px]"
                )}>
                    <div className="h-full w-full bg-white dark:bg-neutral-950 lg:rounded-l-3xl lg:border-l border-neutral-200 dark:border-neutral-800 shadow-xl relative">
                        <ScrollArea className="h-full w-full">
                            {children}
                        </ScrollArea>
                    </div>
                </main>
            </div>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />
        </>
    )
}

const UniLayout = ({ children }: LayoutProps) => {
    const isOnline = useNetworkStatus()
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [universityData, setUniversityData] = useState<UniversityData | null>(null)
    const [loading, setLoading] = useState(true)
    const [needsVerification, setNeedsVerification] = useState(false)

    // Allow access to verify page without verification
    const isVerifyPage = pathname === '/uni/verify'

    useEffect(() => {
        const checkUniversityVerification = async () => {
            if (status === "authenticated" && session?.user) {
                try {
                    const response = await getStudentUniversityLink()
                    if (response.success && response.data) {
                        const data = response.data
                        if (data.verificationStatus === "VERIFIED") {
                            setUniversityData({
                                universityName: data.university.name,
                                credits: data.creditsAllocated - data.creditsUsed,
                                verificationStatus: "VERIFIED"
                            })
                            setNeedsVerification(false)
                        } else {
                            // User has pending or rejected status
                            setUniversityData(null)
                            setNeedsVerification(true)
                        }
                    } else {
                        // User has no university link
                        setUniversityData(null)
                        setNeedsVerification(true)
                    }
                } catch (error) {
                    console.error("Error checking university verification:", error)
                    setUniversityData(null)
                    setNeedsVerification(true)
                } finally {
                    setLoading(false)
                }
            } else if (status === "unauthenticated") {
                router.push("/signin")
            } else if (status !== "loading") {
                setLoading(false)
            }
        }

        checkUniversityVerification()
    }, [status, session, router])

    if (!isOnline) return <OfflineFallback />

    if (status === "loading" || loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    <p className="text-sm text-neutral-500 font-mono">Loading university portal...</p>
                </div>
            </div>
        )
    }

    // Allow verify page without verification
    if (isVerifyPage) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                {children}
            </div>
        )
    }

    // If user needs verification, show verification prompt
    if (needsVerification && !universityData) {
        return <UniversityVerificationRequired />
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-neutral-100 dark:bg-black overflow-hidden">
                <UniContent universityData={universityData}>{children}</UniContent>
            </div>
        </SidebarProvider>
    )
}

const UniversityVerificationRequired = () => {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center"
            >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                    University Verification Required
                </h1>
                <p className="text-neutral-500 mb-6">
                    To access the university module, you need to verify your enrollment with a registered university.
                </p>
                <div className="space-y-3">
                    <Link href="/uni/verify">
                        <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                            Verify University
                        </Button>
                    </Link>
                    <Link href="/home">
                        <Button variant="outline" className="w-full rounded-xl">
                            Back to Home
                        </Button>
                    </Link>
                </div>
                <p className="text-xs text-neutral-400 mt-6">
                    Don&apos;t see your university? Your institution may not be registered yet.
                    Contact your university administration for more information.
                </p>
            </motion.div>
        </div>
    )
}

const OfflineFallback = () => {
    const handleRefresh = () => window.location.reload()

    return (
        <div className="h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center text-center max-w-md"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="mb-6"
                    >
                        <WifiOff className="w-16 h-16 text-muted-foreground" />
                    </motion.div>
                    <h2 className="text-2xl font-semibold mb-2 text-foreground">You&apos;re Offline</h2>
                    <p className="text-muted-foreground mb-6">
                        It looks like you&apos;ve lost your internet connection. Please check your network settings and try again.
                    </p>
                    <motion.button
                        onClick={handleRefresh}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Retry
                    </motion.button>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default UniLayout
