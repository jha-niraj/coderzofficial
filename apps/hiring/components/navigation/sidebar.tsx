"use client"

import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "@repo/auth/client"
import Link from "next/link"
import Image from "next/image"
import {
    LogOut, ChevronLeft, ChevronRight, Menu, Layers, Home, Briefcase,
    Users, Building2, FileText, BarChart3, Settings, CreditCard,
    HelpCircle, UserPlus, ClipboardList
} from "lucide-react"
import {
    TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
} from "@repo/ui/components/ui/tooltip"
import { cn } from "@repo/ui/lib/utils"
import { ThemeToggle } from "@repo/ui/components/themetoggle"
import { useSidebar } from "./sidebarprovider"
import { Button } from "@repo/ui/components/ui/button"
import {
    Sheet, SheetContent
} from "@repo/ui/components/ui/sheet"

interface NavItemProps {
    path: string
    name: string
    icon: React.ReactNode
    isActive: boolean
    isCollapsed: boolean
    onClick: () => void
}

const NavItem = ({ name, icon, isActive, isCollapsed, onClick }: NavItemProps) => {
    const content = (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center rounded-xl p-3 text-sm font-medium transition-all cursor-pointer group w-full",
                isCollapsed ? "justify-center" : "justify-start gap-3",
                isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
        >
            <div className="h-5 w-5 flex-shrink-0">{icon}</div>
            {!isCollapsed && <span className="truncate">{name}</span>}
        </button>
    )

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {name}
                </TooltipContent>
            </Tooltip>
        )
    }

    return content
}

const navItems = [
    { path: "/home", name: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { path: "/jobs", name: "Jobs", icon: <Briefcase className="h-5 w-5" /> },
    { path: "/candidates", name: "Candidates", icon: <Users className="h-5 w-5" /> },
    { path: "/applications", name: "Applications", icon: <FileText className="h-5 w-5" /> },
    { path: "/assessments", name: "Assessments", icon: <ClipboardList className="h-5 w-5" /> },
    { path: "/team", name: "Team", icon: <UserPlus className="h-5 w-5" /> },
    { path: "/analytics", name: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
]

const bottomNavItems = [
    { path: "/company", name: "Company", icon: <Building2 className="h-5 w-5" /> },
    { path: "/billing", name: "Billing", icon: <CreditCard className="h-5 w-5" /> },
    { path: "/settings", name: "Settings", icon: <Settings className="h-5 w-5" /> },
    { path: "/help", name: "Help", icon: <HelpCircle className="h-5 w-5" /> },
]

function SidebarContent({ isCollapsed, onClose }: { isCollapsed: boolean; onClose?: () => void }) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession()

    const handleNavigation = (path: string) => {
        router.push(path)
        onClose?.()
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" })
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex flex-col h-full">
                <div className={cn(
                    "p-4 border-b border-neutral-200 dark:border-neutral-800",
                    isCollapsed && "px-2"
                )}>
                    <Link href="/home" className={cn(
                        "flex items-center gap-3 group",
                        isCollapsed && "justify-center"
                    )}>
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                            <Layers className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        {
                            !isCollapsed && (
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                                        FlowSync
                                    </span>
                                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">
                                        Hiring Portal
                                    </span>
                                </div>
                            )
                        }
                    </Link>
                </div>
                {
                    status === "authenticated" && session && (
                        <div className={cn(
                            "p-4 border-b border-neutral-200 dark:border-neutral-800",
                            isCollapsed && "p-2"
                        )}>
                            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                                {
                                    session.user?.image ? (
                                        <Image
                                            className={cn("rounded-full flex-shrink-0", isCollapsed ? "h-9 w-9" : "h-10 w-10")}
                                            src={session.user.image}
                                            alt={`${session.user.name || "User"}'s profile`}
                                            width={40}
                                            height={40}
                                        />
                                    ) : (
                                        <div className={cn(
                                            "rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center flex-shrink-0",
                                            isCollapsed ? "h-9 w-9" : "h-10 w-10"
                                        )}>
                                            <span className="text-white dark:text-black text-sm font-semibold">
                                                {session.user?.name?.[0] || "U"}
                                            </span>
                                        </div>
                                    )
                                }
                                {
                                    !isCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                                                {session.user?.name || "User"}
                                            </h3>
                                            <p className="text-xs text-neutral-500 truncate">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )
                }
                <div className="flex-grow overflow-y-auto py-4 px-3 space-y-1">
                    {
                        navItems.map((item) => (
                            <NavItem
                                key={item.path}
                                {...item}
                                isActive={pathname === item.path || pathname.startsWith(item.path + "/")}
                                isCollapsed={isCollapsed}
                                onClick={() => handleNavigation(item.path)}
                            />
                        ))
                    }
                </div>
                <div className="px-3 pb-4 pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
                    {
                        bottomNavItems.map((item) => (
                            <NavItem
                                key={item.path}
                                {...item}
                                isActive={pathname === item.path}
                                isCollapsed={isCollapsed}
                                onClick={() => handleNavigation(item.path)}
                            />
                        ))
                    }
                    <div className={cn("py-2", isCollapsed ? "flex justify-center" : "px-1")}>
                        <ThemeToggle />
                    </div>
                    {
                        status === "authenticated" && (
                            isCollapsed ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleSignOut}
                                            className="cursor-pointer flex items-center justify-center w-full rounded-xl p-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Sign Out</TooltipContent>
                                </Tooltip>
                            ) : (
                                <button
                                    onClick={handleSignOut}
                                    className="cursor-pointer flex items-center gap-3 w-full rounded-xl p-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Sign Out</span>
                                </button>
                            )
                        )
                    }
                </div>
            </div>
        </TooltipProvider>
    )
}

export function HiringSidebar() {
    const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()

    return (
        <>
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 z-40 transition-all duration-300",
                    isCollapsed ? "w-[90px]" : "w-64"
                )}
            >
                <SidebarContent isCollapsed={isCollapsed} />
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="cursor-pointer absolute -right-3 top-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full p-1.5 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    {
                        isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                        )
                    }
                </button>
            </aside>
            <Button
                variant="outline"
                size="icon"
                className="cursor-pointer lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-neutral-900"
                onClick={() => setIsMobileOpen(true)}
            >
                <Menu className="h-5 w-5" />
            </Button>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent isCollapsed={false} onClose={() => setIsMobileOpen(false)} />
                </SheetContent>
            </Sheet>
        </>
    )
}