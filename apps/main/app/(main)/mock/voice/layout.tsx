import { VoiceSidebar } from './_components/voice-sidebar'
import { Suspense } from 'react';

export default function VoiceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-white dark:bg-neutral-950 overflow-hidden">
            <div className="w-[320px] max-w-[320px] flex-shrink-0 h-full border-r border-neutral-200 dark:border-neutral-800 hidden lg:block">
                <Suspense fallback={<div className="p-6">Loading sidebar...</div>}>
                    <VoiceSidebar />
                </Suspense>
            </div>
            <main className="flex-1 h-full overflow-y-auto">
                <div className="h-full w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}