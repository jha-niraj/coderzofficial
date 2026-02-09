"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { checkMustChangePassword } from "@/actions/profile/profile.action"

export function PasswordChangeBanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        async function check() {
            const result = await checkMustChangePassword()
            if (result.success && result.mustChangePassword) {
                setShowBanner(true)
            }
        }
        check()
    }, [])

    if (!showBanner || dismissed) {
        return null
    }

    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <span className="font-semibold">Security Notice:</span> You&apos;re using a temporary password. Please change it to secure your account.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/profile#security">
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
                        >
                            Change Password
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
