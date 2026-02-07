"use client"

import { 
    SidebarProvider, useSidebar 
} from "@/components/navigation/sidebarprovider"
import { HiringSidebar } from "@/components/navigation/sidebar"
import { cn } from "@repo/ui/lib/utils"
import { useSession } from "@repo/auth/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { 
    Loader2 
} from "lucide-react"
import Script from "next/script"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"

function HiringLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar()
    const { data: session, status } = useSession()
    const router = useRouter()

    // Redirect to signin if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin")
        }
    }, [status, router])

    // Redirect to onboarding if not completed
    useEffect(() => {
        if (status === "authenticated" && session) {
            const user = session.user as { onboardingCompleted?: boolean }
            if (!user.onboardingCompleted) {
                router.push("/onboarding")
            }
        }
    }, [status, session, router])

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                    <p className="text-sm text-neutral-500 font-mono">Initializing workspace...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <HiringSidebar />
            <main
                className={cn(
                    "h-screen transition-all duration-300",
                    "lg:ml-64 p-3",
                    isCollapsed && "lg:ml-[90px]"
                )}
            >
                <div className="h-full bg-white dark:bg-neutral-950 lg:rounded-l-3xl lg:border-l border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
                    <ScrollArea className="h-full w-full">
                        {children}
                    </ScrollArea>
                </div>
            </main>
        </div>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {/* Razorpay Script */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
            />
            <SidebarProvider>
                <HiringLayoutContent>{children}</HiringLayoutContent>
            </SidebarProvider>
        </>
    )
}
