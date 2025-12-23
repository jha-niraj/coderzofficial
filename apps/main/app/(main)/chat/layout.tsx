import { Suspense } from "react"
import ChatSidebar from "@/components/chat/chat-sidebar"

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-[calc(100vh-4rem)] flex">
            <div className="w-80 border-r border-border/50 flex-shrink-0">
                <Suspense fallback={<ChatSidebarSkeleton />}>
                    <ChatSidebar />
                </Suspense>
            </div>
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    )
}

function ChatSidebarSkeleton() {
    return (
        <div className="h-full flex flex-col p-4 space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded-lg" />
            <div className="flex gap-2">
                <div className="h-9 flex-1 bg-muted rounded-lg" />
                <div className="h-9 flex-1 bg-muted rounded-lg" />
            </div>
            {
                [...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                ))
            }
        </div>
    )
}