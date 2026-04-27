import { VoiceSidebar } from './_components/voice-sidebar'
import { Suspense } from 'react'

export default function VoiceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-white dark:bg-neutral-950">
            {/* Mobile: horizontal top bar — Desktop: sticky left sidebar */}
            <div className="w-full lg:w-[280px] lg:min-w-[280px] lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen border-b border-neutral-200 dark:border-neutral-800 lg:border-b-0 lg:border-r">
                <Suspense fallback={<div className="p-4 text-sm text-neutral-400">Loading...</div>}>
                    <VoiceSidebar />
                </Suspense>
            </div>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}