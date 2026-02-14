'use client'

import { MousePointerClick } from 'lucide-react'

export function ExploreContent() {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                    <MousePointerClick className="w-8 h-8 text-neutral-400" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Select a goal to view its content
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Choose a public goal from the sidebar to preview its sub-goals and structure.
                    You can copy any goal to your own workspace.
                </p>
            </div>
        </div>
    )
}
