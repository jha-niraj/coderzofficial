"use client"

import { SidebarProvider, useSidebar } from "@/components/navigation/sidebarprovider"
import { PlatformSidebar } from "@/components/navigation/platform-sidebar"
import { cn } from "@repo/ui/lib/utils"
import { useSession } from "@repo/auth/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, LayoutDashboard, Users, CreditCard, MessageCircle, BarChart3, Receipt, FileText, Coins } from "lucide-react"

const mainPlatformConfig = {
    name: "Main Platform",
    icon: LayoutDashboard,
    color: "bg-blue-500",
    bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
    textColor: "text-blue-600 dark:text-blue-400",
    overviewHref: "/dashboard",
    navItems: [
        { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
        { name: "Users", path: "users", icon: Users },
        {
            name: "Credits",
            path: "credits",
            icon: CreditCard,
            children: [
                { name: "Transactions", path: "credits/transactions", icon: Receipt },
                { name: "Requests", path: "credits/requests", icon: FileText },
                { name: "Payments", path: "credits/payments", icon: Coins },
            ]
        },
        { name: "Feedback", path: "feedback", icon: MessageCircle },
        { name: "Analytics", path: "analytics", icon: BarChart3 },
    ]
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar()
    const { data: session, isPending } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (!session && !isPending) {
            router.push("/")
        }
    }, [session, isPending, router])

    if (isPending) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        )
    }

    if (!session) return null

    return (
        <div className="h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <PlatformSidebar platform={mainPlatformConfig} />
            <main className={cn(
                "h-screen transition-all duration-300",
                "lg:ml-64 p-3",
                isCollapsed && "lg:ml-[90px]"
            )}>
                <div className="h-screen bg-white dark:bg-neutral-950 lg:rounded-l-3xl lg:border-l border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
                    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function MainPlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    )
}
