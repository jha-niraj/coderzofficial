"use client"

import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Rocket, Plus, Sparkles } from "lucide-react"
import Link from "next/link"

export function LaunchpadsHeader() {
    return (
        <header className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-white via-neutral-50 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 flex items-center justify-center shadow-lg">
                            <Rocket className="w-6 h-6 text-white dark:text-neutral-900" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Launchpads
                                </h1>
                                <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    New
                                </Badge>
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                Discover innovative products built by Coderz and the community
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/launchpads/submit">
                            <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full px-5">
                                <Plus className="w-4 h-4 mr-2" />
                                Submit Product
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
