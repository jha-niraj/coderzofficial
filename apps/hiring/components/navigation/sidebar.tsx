"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@repo/auth/client";
import { useTheme } from "@repo/ui/components/themeprovider";
import Link from "next/link";
import Image from "next/image";
import {
    LogOut, User, Sun, Moon, Bell, ChevronLeft, ChevronRight,
    AlignLeft, Layers
} from "lucide-react";
import {
    Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { format } from "date-fns";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { useSidebar } from "./sidebarprovider";
import { 
    hiringNavigation, NavigationItem 
} from "../../lib/navigation";
import { 
    getNotifications, markNotificationAsRead 
} from "../../actions/notifications/notifications.action";

interface Notification {
    id: string;
    title: string;
    message: string;
    actionUrl?: string | null;
    read: boolean;
    createdAt: Date;
}

export function HiringSidebar() {
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const { data: session, status } = useSession();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const notificationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Close mobile menu on path change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (session?.user) {
                try {
                    const result = await getNotifications();
                    if (result.success && result.notifications) {
                        setNotifications(result.notifications as unknown as Notification[]);
                        setUnreadCount(result.unreadCount || 0);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };
        fetchNotifications();
    }, [session]);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            try {
                await markNotificationAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
            } catch (error) {
                console.error("Failed to mark read", error);
            }
        }

        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
        setNotificationsDropdownOpen(false);
    };

    const handleProfileMouseEnter = () => {
        if (profileTimeoutRef.current) {
            clearTimeout(profileTimeoutRef.current);
        }
        setProfileDropdownOpen(true);
    };

    const handleProfileMouseLeave = () => {
        if (profileTimeoutRef.current) {
            clearTimeout(profileTimeoutRef.current);
        }
        profileTimeoutRef.current = setTimeout(() => {
            setProfileDropdownOpen(false);
        }, 150);
    };

    const handleNotificationsMouseEnter = () => {
        if (notificationsTimeoutRef.current) {
            clearTimeout(notificationsTimeoutRef.current);
        }
        setNotificationsDropdownOpen(true);
    };

    const handleNotificationsMouseLeave = () => {
        if (notificationsTimeoutRef.current) {
            clearTimeout(notificationsTimeoutRef.current);
        }
        notificationsTimeoutRef.current = setTimeout(() => {
            setNotificationsDropdownOpen(false);
        }, 150);
    };

    const renderNavItem = (item: NavigationItem) => {
        // Adjust path logic: hiring app might have relative or absolute paths. 
        // Current navItems use "/home".
        // New Sidebar expects "/"+path.

        // Remove leading slash for logic consistency if present
        const cleanPath = item.path.startsWith('/') ? item.path.substring(1) : item.path;

        const isActive = pathname === `/${cleanPath}` || pathname.startsWith(`/${cleanPath}/`);

        const Icon = item.icon;

        const linkContent = (
            <Link
                key={cleanPath}
                href={`/${cleanPath}`}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
                    isCollapsed && "justify-center px-3"
                )}
            >
                <div className={cn("flex-shrink-0 flex items-center justify-center", "h-5 w-5")}>
                    <Icon className="h-5 w-5" />
                </div>
                {
                    !isCollapsed && (
                        <span className="whitespace-nowrap overflow-hidden">{item.name}</span>
                    )
                }
            </Link>
        );

        return isCollapsed ? (
            <Tooltip key={cleanPath}>
                <TooltipTrigger asChild>
                    {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-800 dark:border-neutral-200">
                    {item.name}
                </TooltipContent>
            </Tooltip>
        ) : linkContent;
    };

    const renderSidebarContent = () => (
        <>
            <div className={cn("p-6 flex items-center relative border-b border-neutral-200 dark:border-neutral-800", isCollapsed ? "justify-center" : "gap-3")}>
                <Link href="/home" className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 flex items-center justify-center bg-neutral-900 dark:bg-white rounded-xl">
                        <Layers className="h-6 w-6 text-white dark:text-black" />
                    </div>
                    {
                        !isCollapsed && (
                            <div className="flex-1 text-left min-w-0 hidden lg:block">
                                <h1 className="font-bold text-neutral-900 dark:text-white truncate tracking-tight">FlowSync</h1>
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate uppercase tracking-widest font-mono">
                                    Hiring Portal
                                </p>
                            </div>
                        )
                    }
                </Link>
                {
                    setIsCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:block absolute top-6 -right-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-50 shadow-lg"
                        >
                            {isCollapsed ? <ChevronRight className="w-4 h-4 text-neutral-900 dark:text-white" /> : <ChevronLeft className="w-4 h-4 text-neutral-900 dark:text-white" />}
                        </button>
                    )
                }
            </div>
            <ScrollArea className="flex-1">
                <nav className="px-3 py-4 space-y-1">
                    {hiringNavigation.primary.map((item) => renderNavItem(item))}

                    <div className="my-4 border-t border-neutral-200 dark:border-neutral-800" />

                    {hiringNavigation.secondary.map((item) => renderNavItem(item))}
                </nav>
            </ScrollArea>
            <div className="mt-auto border-t border-neutral-200 dark:border-neutral-800">
                <div className={cn("p-2", isCollapsed ? "flex justify-center" : "grid grid-cols-2 gap-2")}>
                    <div className={isCollapsed ? "mb-2" : ""}>
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={cn(
                                "flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full",
                                isCollapsed && "aspect-square"
                            )}
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            {!isCollapsed && <span className="ml-2">Theme</span>}
                        </button>
                    </div>
                    {
                        status === "authenticated" && session && (
                            <div
                                className="relative"
                                onMouseEnter={handleNotificationsMouseEnter}
                                onMouseLeave={handleNotificationsMouseLeave}
                            >
                                <button className={cn(
                                    "flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full",
                                    isCollapsed && "aspect-square"
                                )}>
                                    <div className="relative">
                                        <Bell className="h-5 w-5" />
                                        {
                                            unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-600 border border-white dark:border-neutral-950"></span>
                                            )
                                        }
                                    </div>
                                    {!isCollapsed && <span className="ml-2">Inbox</span>}
                                </button>
                                {
                                    notificationsDropdownOpen && (
                                        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden">
                                            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
                                                <h3 className="font-semibold text-sm">Notifications</h3>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {
                                                    notifications.length === 0 ? (
                                                        <div className="p-4 text-center text-neutral-500 text-sm">No notifications</div>
                                                    ) : (
                                                        notifications.map(notification => (
                                                            <button
                                                                key={notification.id}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={cn(
                                                                    "w-full text-left p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800/50 last:border-0",
                                                                    !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
                                                                )}
                                                            >
                                                                <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                                                                <p className="text-xs text-neutral-500 mt-1">{format(new Date(notification.createdAt), "MMM d, h:mm a")}</p>
                                                            </button>
                                                        ))
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                </div>
                {
                    status === "authenticated" && session ? (
                        <div
                            className="relative px-3 py-2"
                            onMouseEnter={handleProfileMouseEnter}
                            onMouseLeave={handleProfileMouseLeave}
                        >
                            <button className={cn("flex cursor-pointer items-center gap-3 w-full rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 transition-colors", isCollapsed && "justify-center")}>
                                {
                                    session?.user?.image ? (
                                        <Image
                                            className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800"
                                            src={session.user.image}
                                            alt="User"
                                            width={32}
                                            height={32}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center">
                                            <span className="text-white dark:text-black text-xs font-bold">{session?.user?.name?.[0] || 'U'}</span>
                                        </div>
                                    )
                                }
                                {
                                    !isCollapsed && (
                                        <div className="flex-1 text-left min-w-0 hidden lg:block">
                                            <p className="text-sm font-bold truncate">{session?.user?.name}</p>
                                            <p className="text-[10px] text-neutral-500 truncate">{session?.user?.email}</p>
                                        </div>
                                    )
                                }
                            </button>
                            {
                                profileDropdownOpen && (
                                    <div
                                        className="absolute left-full ml-2 bottom-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl z-50 w-64 overflow-hidden"
                                        onMouseEnter={handleProfileMouseEnter}
                                        onMouseLeave={handleProfileMouseLeave}
                                    >
                                        <div className="p-2">
                                            <button onClick={() => router.push('/settings')} className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm">
                                                <User className="h-4 w-4" />
                                                Profile
                                            </button>
                                            <button onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-md transition-colors text-sm">
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    ) : (
                        <div className="px-3 py-2">
                            <button
                                onClick={() => router.push('/')}
                                className={cn(
                                    "flex items-center w-full rounded-lg p-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                    isCollapsed && "justify-center"
                                )}
                            >
                                <User className="h-5 w-5" />
                                {!isCollapsed && <span className="ml-3">Sign In</span>}
                            </button>
                        </div>
                    )
                }
            </div>
        </>
    );

    return (
        <TooltipProvider>
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-2 left-2 z-50 lg:hidden bg-white dark:bg-neutral-950 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800"
            >
                <AlignLeft className="h-5 w-5" />
            </button>

            {
                isMobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )
            }

            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col z-40 transition-all duration-300",
                    "hidden lg:flex",
                    isCollapsed ? "w-[90px]" : "w-64"
                )}
            >
                {renderSidebarContent()}
            </aside>
            <div className={cn(
                "fixed top-0 left-0 h-full w-64 bg-white dark:bg-neutral-950 z-50 transition-transform duration-300 transform border-r border-neutral-200 dark:border-neutral-800 lg:hidden flex flex-col",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {renderSidebarContent()}
            </div>
        </TooltipProvider>
    );
}