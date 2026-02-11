"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@repo/auth/client";
import { useTheme } from "@repo/ui/components/themeprovider";
import Link from "next/link";
import Image from "next/image";
import {
    LogOut, User, Sun, Moon, Bell, ChevronLeft, ChevronRight, ChevronDown,
    AlignLeft, Shield, Code, Building2, GraduationCap
} from "lucide-react";
import {
    Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
// import {
//     getRecentNotifications, markNotificationAsRead, type Notification
// } from "@/actions/shared/notifications.action";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { useSidebar } from "./sidebarprovider";
import {
    adminNavigation, type NavigationItem, type PlatformNavigationItem
} from "@/lib/navigation";

// Mock Notification type since action is missing
interface Notification {
    id: string;
    title: string;
    description?: string;
    actionUrl?: string;
    read: boolean;
    createdAt: Date;
}

const platformIcons = {
    main: Code,
    hiring: Building2,
    uni: GraduationCap,
};

const platformColors = {
    main: {
        bg: "bg-blue-500",
        bgLight: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500",
        ring: "ring-blue-500/20",
    },
    hiring: {
        bg: "bg-emerald-500",
        bgLight: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500",
        ring: "ring-emerald-500/20",
    },
    uni: {
        bg: "bg-violet-500",
        bgLight: "bg-violet-50 dark:bg-violet-900/20",
        text: "text-violet-600 dark:text-violet-400",
        border: "border-violet-500",
        ring: "ring-violet-500/20",
    },
};

type Platform = "main" | "hiring" | "uni" | null;

export function AdminSidebar() {
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const { data: session, status } = useSession();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
    const [notifications] = useState<Notification[]>([]);
    const [unreadCount] = useState(0);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [activePlatform, setActivePlatform] = useState<Platform>(null);

    const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const notificationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Close mobile menu on path change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Detect active platform from URL
    useEffect(() => {
        if (pathname.startsWith("/main")) {
            setActivePlatform("main");
        } else if (pathname.startsWith("/hiring")) {
            setActivePlatform("hiring");
        } else if (pathname.startsWith("/uni")) {
            setActivePlatform("uni");
        } else {
            setActivePlatform(null);
        }
    }, [pathname]);

    const toggleItemExpanded = (path: string) => {
        setExpandedItems(prev => {
            if (prev.includes(path)) {
                return prev.filter(p => p !== path);
            }
            return [path];
        });
    };

    // Auto-expand active parent item
    useEffect(() => {
        const allPlatformItems = adminNavigation.platforms.flatMap(p => p.children || []);
        const allItems = [...adminNavigation.global, ...allPlatformItems, ...adminNavigation.secondary];

        for (const item of allItems) {
            if (item.children) {
                for (const child of item.children) {
                    if (pathname.startsWith(`/${child.path}`)) {
                        setExpandedItems(prev => prev.includes(item.path) ? prev : [...prev, item.path]);
                        break;
                    }
                }
            }
        }
    }, [pathname]);


    // Fetch notifications (Mocked/Disabled)
    /*
    useEffect(() => {
        if (session?.user) {
            fetchNotifications();
        }
    }, [session]);

    const fetchNotifications = async () => {
        try {
            const result = await getRecentNotifications(5);
            if (result.success) {
                setNotifications(result.notifications || []);
                setUnreadCount(result.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };
    */
    const handleNotificationClick = async (notification: Notification) => {
        /*
        try {
            if (!notification.read) {
                await markNotificationAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
            }

            if (notification.actionUrl) {
                router.push(notification.actionUrl);
            }
            setNotificationsDropdownOpen(false);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
        */
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

    // Adapted renderNavItem for Admin NavigationItems
    const renderNavItem = (item: NavigationItem, depth: number = 0) => {
        const itemPath = item.path;
        const itemName = item.name;
        const Icon = item.icon;

        const hasChildren = item.children && item.children.length > 0;
        const isChildActive = hasChildren && item.children!.some((child) => pathname.startsWith(`/${child.path}`));
        const isParentActive = pathname === `/${itemPath}` || pathname.startsWith(`/${itemPath}/`);
        const isExpanded = expandedItems.includes(itemPath) || ((isChildActive || isParentActive) && !isCollapsed);
        const isActive = pathname === `/${itemPath}` || pathname.startsWith(`/${itemPath}/`);

        if (hasChildren) {
            const handleParentClick = () => {
                // Navigate to parent route
                router.push(`/${itemPath}`);
                // Expand dropdown if not already expanded
                if (!expandedItems.includes(itemPath)) {
                    setExpandedItems(() => [itemPath]);
                }
            };

            const handleChevronClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                toggleItemExpanded(itemPath);
            };

            return (
                <div key={itemPath} className="space-y-1">
                    <button
                        onClick={handleParentClick}
                        className={cn(
                            "cursor-pointer flex items-center w-full gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                            (isChildActive || isParentActive)
                                ? "text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800/50"
                                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
                            isCollapsed && "justify-center px-3"
                        )}
                    >
                        <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                        </div>
                        {
                            !isCollapsed && (
                                <>
                                    <span className="flex-1 text-left whitespace-nowrap overflow-hidden">{itemName}</span>
                                    <div
                                        onClick={handleChevronClick}
                                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                                    >
                                        <ChevronDown className={cn(
                                            "h-4 w-4 transition-transform",
                                            isExpanded && "rotate-180"
                                        )} />
                                    </div>
                                </>
                            )
                        }
                    </button>
                    <AnimatePresence>
                        {
                            isExpanded && !isCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden pl-4 space-y-1"
                                >
                                    {
                                        item.children!.map((child) => renderNavItem(child, depth + 1))
                                    }
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                </div>
            );
        }

        const linkContent = (
            <Link
                key={itemPath}
                href={`/${itemPath}`}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    depth > 0 && "text-xs",
                    isActive
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
                    isCollapsed && "justify-center px-3"
                )}
            >
                <div className={cn("flex-shrink-0 flex items-center justify-center", depth > 0 ? "h-4 w-4" : "h-5 w-5")}>
                    <Icon className={cn("flex-shrink-0", depth > 0 ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                {
                    !isCollapsed && (
                        <span className="whitespace-nowrap overflow-hidden">{itemName}</span>
                    )
                }
            </Link>
        );

        return isCollapsed ? (
            <Tooltip key={itemPath}>
                <TooltipTrigger asChild>
                    {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-800 dark:border-neutral-200">
                    {itemName}
                </TooltipContent>
            </Tooltip>
        ) : linkContent;
    };

    const renderPlatformSwitcher = () => {
        if (isCollapsed) {
            return (
                <div className="px-3 space-y-2">
                    {adminNavigation.platforms.map((platform) => {
                        const Icon = platformIcons[platform.path as keyof typeof platformIcons];
                        const colors = platformColors[platform.path as keyof typeof platformColors];
                        const isActive = activePlatform === platform.path;

                        return (
                            <Tooltip key={platform.path}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={`/${platform.path}`}
                                        className={cn(
                                            "flex items-center justify-center w-full p-2.5 rounded-lg transition-all",
                                            isActive
                                                ? cn(colors.bg, "text-white shadow-md")
                                                : cn("hover:bg-neutral-100 dark:hover:bg-neutral-800", colors.text)
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="bg-neutral-900 dark:bg-white text-white dark:text-black">
                                    {platform.name}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="px-3">
                <p className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 px-2 mb-2 tracking-widest">
                    Platforms
                </p>
                <div className="space-y-1">
                    {adminNavigation.platforms.map((platform) => {
                        const Icon = platformIcons[platform.path as keyof typeof platformIcons];
                        const colors = platformColors[platform.path as keyof typeof platformColors];
                        const isActive = activePlatform === platform.path;

                        return (
                            <Link
                                key={platform.path}
                                href={`/${platform.path}`}
                                className={cn(
                                    "flex items-center gap-3 w-full p-2.5 rounded-xl transition-all",
                                    isActive
                                        ? cn(colors.bg, "text-white shadow-md")
                                        : cn("hover:bg-neutral-100 dark:hover:bg-neutral-800", colors.text)
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-lg",
                                    isActive ? "bg-white/20" : colors.bgLight
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "font-medium text-sm truncate",
                                        isActive ? "text-white" : "text-neutral-900 dark:text-white"
                                    )}>
                                        {platform.name}
                                    </p>
                                </div>
                                <ChevronRight className={cn(
                                    "h-4 w-4",
                                    isActive ? "text-white/70" : "text-neutral-400"
                                )} />
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPlatformNav = (platform: PlatformNavigationItem) => {
        const colors = platformColors[platform.path as keyof typeof platformColors];

        return (
            <div className="space-y-1">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 px-2 mb-2">
                        <div className={cn("w-1 h-3 rounded-full", colors.bg)} />
                        <p className={cn("text-[10px] font-mono font-bold uppercase tracking-widest", colors.text)}>
                            {platform.name}
                        </p>
                    </div>
                )}
                {platform.children?.map((item) => renderNavItem(item))}
            </div>
        );
    };

    const renderSidebarContent = () => {
        const currentPlatform = activePlatform
            ? adminNavigation.platforms.find(p => p.path === activePlatform)
            : null;

        return (
            <>
                {/* Header */}
                <div className={cn("p-6 flex items-center relative border-b border-neutral-200 dark:border-neutral-800", isCollapsed ? "justify-center" : "gap-3")}>
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        {
                            !isCollapsed && (
                                <div className="flex-1 text-left min-w-0 hidden lg:block">
                                    <h1 className="font-bold text-neutral-900 dark:text-white truncate tracking-tight">Admin Panel</h1>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate uppercase tracking-widest font-mono">
                                        Multi-Platform Control
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

                {/* Navigation Content */}
                <ScrollArea className="flex-1">
                    <nav className="px-3 py-4 space-y-4">
                        {/* Global Navigation */}
                        <div className="space-y-1">
                            {adminNavigation.global?.map((item) => renderNavItem(item))}
                        </div>

                        {/* Platform Switcher or Platform Nav */}
                        {!activePlatform ? (
                            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                                {renderPlatformSwitcher()}
                            </div>
                        ) : (
                            <>
                                {/* Back to Overview */}
                                <div className="">
                                    <Link
                                        href="/dashboard"
                                        className={cn(
                                            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                            "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        )}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        {!isCollapsed && <span>All Platforms</span>}
                                    </Link>
                                </div>

                                {/* Platform-specific Navigation */}
                                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                                    {currentPlatform && renderPlatformNav(currentPlatform)}
                                </div>
                            </>
                        )}

                        {/* Secondary Navigation */}
                        {adminNavigation.secondary && adminNavigation.secondary.length > 0 && (
                            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                                {
                                    !isCollapsed && (
                                        <p className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400 px-2 mb-2 tracking-widest">Administration</p>
                                    )
                                }
                                <div className="space-y-1">
                                    {adminNavigation.secondary.map((item) => renderNavItem(item))}
                                </div>
                            </div>
                        )}
                    </nav>
                </ScrollArea>

                {/* Footer / Profile */}
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
                                                <span className="text-white dark:text-black text-xs font-bold">{session?.user?.name?.[0] || 'A'}</span>
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
                                                <button onClick={() => router.push('/admins/profile')} className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm">
                                                    <User className="h-4 w-4" />
                                                    Profile Settings
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
    };

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
                "fixed top-0 left-0 h-full w-64 bg-white dark:bg-neutral-950 z-40 transition-transform duration-300 transform border-r border-neutral-200 dark:border-neutral-800 lg:hidden flex flex-col",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {renderSidebarContent()}
            </div>
        </TooltipProvider>
    );
}