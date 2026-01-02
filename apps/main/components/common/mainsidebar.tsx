"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@repo/auth/client";
import Link from "next/link";
import Image from "next/image";
import toast from "@repo/ui/components/ui/sonner";
import {
    LogOut, User, Bell, ChevronLeft, ChevronRight, ChevronDown, Coins, 
    Crown, Loader, Sun, Moon, AlignLeft, Plus, LayoutDashboard, Share2, 
    MessageCircleCodeIcon, Award
} from "lucide-react";
import {
    TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import mainWebLogo from "@/utils/titlelogo.png";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from "@repo/ui/components/ui/sheet";
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { useUserStore } from "@/app/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@repo/ui/components/ui/slider";
import { convertXpToCredits } from "@/actions/(main)/subscription/credits.action";
import { Progress } from "@repo/ui/components/ui/progress";
import { getUserReferralCode } from "@/actions/(main)/user/user.action";
import { getUserLevelInfo } from "@/actions/(main)/user/level.action";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { useTheme } from "@repo/ui/components/themeprovider";
import { mainNavigation, NavigationItem } from "../../lib/navigation";

// --- Types ---
interface Notification {
    id: string;
    title: string;
    description?: string;
    actionUrl?: string;
    read: boolean;
    createdAt: Date;
}

import { useSidebar } from "./sidebarprovider";

// --- Interfaces for Gamification ---
interface LevelConfig {
    level: number;
    title: string;
    xpRequired: number;
    xpReward: number;
    creditsReward: number;
    description: string;
    icon: string;
    color: string;
}

interface LevelCalculation {
    currentLevel: number;
    progressInCurrentLevel: number;
    xpNeededForNextLevel: number;
    progressPercentage: number;
    nextLevelXp: number;
    currentLevelXp: number;
}

interface LevelUpHistory {
    levelInfo: {
        icon: string | null;
        title: string;
    };
    achievedAt: string | Date;
    xpEarned: number;
    creditsEarned: number;
}

interface UserLevelData {
    currentXp: number;
    totalXp: number;
    currentLevel: number;
    credits: number;
    levelInfo: LevelCalculation;
    currentLevelConfig?: LevelConfig;
    nextLevelConfig?: LevelConfig;
    recentLevelUps: LevelUpHistory[];
}

interface SidebarProps {
    className?: string;
}

function SidebarContent() {
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const { data: session, status } = useSession();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
    const [notifications] = useState<Notification[]>([]);
    const [unreadCount] = useState(0);

    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const notificationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Dialog States
    const [referDialogOpen, setReferDialogOpen] = useState(false);
    const [referralLink, setReferralLink] = useState("");
    const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
    const [levelDialogOpen, setLevelDialogOpen] = useState(false);

    // Gamification Logic
    const {
        currentXp, credits, currentLevel, fetchCreditsAndXp, addCredits,
        updateXp, totalXp
    } = useUserStore();
    const [xpToConvert, setXpToConvert] = useState(0);
    const conversionRate = 10;
    const creditsGained = Math.floor(xpToConvert / conversionRate);
    const [maxConvertibleXp] = useState(currentXp);
    const [converting, setConverting] = useState(false);

    // Level Info
    const [levelInfo, setLevelInfo] = useState<UserLevelData | null>(null);
    const [levelInfoLoading, setLevelInfoLoading] = useState(false);

    // --- Effects ---
    // Fetch XP/Credits
    useEffect(() => {
        if (status === "authenticated") {
            fetchCreditsAndXp();
        }
    }, [status, fetchCreditsAndXp]);

    // Fetch Level Info when dialog opens
    useEffect(() => {
        if (levelDialogOpen && status === "authenticated") {
            const fetchLevelInfo = async () => {
                setLevelInfoLoading(true);
                try {
                    const response = await getUserLevelInfo();
                    if (response.success && response.data) {
                        setLevelInfo(response.data);
                    }
                } catch (error) {
                    console.error("Error fetching level info:", error);
                } finally {
                    setLevelInfoLoading(false);
                }
            };
            fetchLevelInfo();
        }
    }, [levelDialogOpen, status]);

    // Fetch Referral Code
    useEffect(() => {
        if (session?.user) {
            const fetchReferralCode = async () => {
                try {
                    const response = await getUserReferralCode();
                    if (!response?.success) return null;
                    const data = response?.data;
                    if (data?.referralCode) {
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
                        setReferralLink(`${baseUrl}/register?ref=${data?.referralCode}`);
                    }
                } catch (error) {
                    console.error("Error fetching referral code:", error);
                }
            };
            fetchReferralCode();
        }
    }, [session]);

    // Auto-expand active routes
    useEffect(() => {
        const fullRoutes = mainNavigation.primary;
        for (const route of fullRoutes) {
            if (route.children) {
                for (const child of route.children) {
                    if (pathname.startsWith(`/${child.path}`)) {
                        setExpandedItems(prev => prev.includes(route.path) ? prev : [...prev, route.path]);
                        break;
                    }
                }
            }
        }
    }, [pathname]);

    // --- Helpers ---
    const toggleItemExpanded = (path: string) => {
        setExpandedItems(prev => {
            if (prev.includes(path)) {
                return prev.filter(p => p !== path);
            }
            return [path];
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        toast("Link Copied!", { description: "Go spread the word, champ." });
    };

    const handleConvert = async () => {
        if (xpToConvert <= 0 || xpToConvert > currentXp) {
            toast("Oops!", { description: "Check your XP amount—can't trade what you don't have!", });
            return;
        }
        setConverting(true);
        try {
            const response = await convertXpToCredits(xpToConvert);
            if (!response) {
                toast("Failed to convert XP to Credits");
                return;
            }
            updateXp(response.newXp, totalXp);
            addCredits(response.creditsGained);
            toast("Trade Successful!", { description: `You've turned ${xpToConvert} XP into ${creditsGained} credits. Nice move!`, });
        } catch (err) {
            console.log("Failed to trade the xp to the credits" + err);
        } finally {
            setTradeDialogOpen(false);
            setConverting(false);
            setXpToConvert(0);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleNotificationClick = async (notification: Notification) => {
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
        setNotificationsDropdownOpen(false);
    };

    const handleProfileMouseEnter = () => {
        if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
        setProfileDropdownOpen(true);
    };

    const handleProfileMouseLeave = () => {
        if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
        profileTimeoutRef.current = setTimeout(() => setProfileDropdownOpen(false), 150);
    };

    const handleNotificationsMouseEnter = () => {
        if (notificationsTimeoutRef.current) clearTimeout(notificationsTimeoutRef.current);
        setNotificationsDropdownOpen(true);
    };

    const handleNotificationsMouseLeave = () => {
        if (notificationsTimeoutRef.current) clearTimeout(notificationsTimeoutRef.current);
        notificationsTimeoutRef.current = setTimeout(() => setNotificationsDropdownOpen(false), 150);
    };

    // --- Renderers ---
    const renderNavItem = (item: NavigationItem) => {
        const itemPath = item.path;
        const itemName = item.name;
        // Handle ReactNode icon or fallback
        const Icon = item.icon || LayoutDashboard;

        const hasChildren = item.children && item.children.length > 0;

        // Active Logic
        // For parent: check if any child is active
        const isChildActive = hasChildren && item.children!.some((child) => pathname.startsWith(`/${child.path}`));
        const isExpanded = expandedItems.includes(itemPath) || (isChildActive && !isCollapsed);

        if (hasChildren) {
            return (
                <div key={itemPath} className="space-y-1">
                    <button
                        onClick={() => toggleItemExpanded(itemPath)}
                        className={cn(
                            "flex items-center w-full gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                            isChildActive
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
                                    <ChevronDown className={cn(
                                        "h-4 w-4 transition-transform",
                                        isExpanded && "rotate-180"
                                    )} />
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
                                        item.children!.map((child) => {
                                            // Render Child Item (Simplified, no infinite recursion for now as structure is Flat->Child)
                                            const childIsActive = pathname === `/${child.path}` || pathname.startsWith(`/${child.path}/`);

                                            // Handle onClick for coming soon
                                            if (child.comingSoon) {
                                                const ChildIcon = child.icon || LayoutDashboard;
                                                return (
                                                    <button
                                                        key={child.path}
                                                        onClick={() => toast.info("Coming Soon", { description: `${child.name} feature is under development` })}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-muted-foreground cursor-not-allowed opacity-60"
                                                        )}
                                                    >
                                                        <div className="w-4 h-4 flex items-center justify-center"><ChildIcon className="w-4 h-4" /></div>
                                                        <span className="truncate">{child.name}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded border border-yellow-500/20 font-semibold ml-auto">SOON</span>
                                                    </button>
                                                )
                                            }

                                            const ChildIcon = child.icon || LayoutDashboard;

                                            return (
                                                <Link
                                                    key={child.path}
                                                    href={`/${child.path}`}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                                        childIsActive
                                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                                                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                                                    )}
                                                >
                                                    <div className="w-4 h-4 flex items-center justify-center"><ChildIcon className="w-4 h-4" /></div>
                                                    <span className="truncate">{child.name}</span>
                                                </Link>
                                            )
                                        })
                                    }
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                </div>
            )
        }

        // Leaf Node
        const isActive = pathname === `/${itemPath}` || pathname.startsWith(`/${itemPath}/`);

        const linkContent = (
            <Link
                key={itemPath}
                href={`/${itemPath}`}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
                    isCollapsed && "justify-center px-3"
                )}
            >
                <div className={cn("flex-shrink-0 flex items-center justify-center h-5 w-5")}>
                    <Icon className="h-5 w-5" />
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


    const allRoutes = mainNavigation.primary;

    return (
        <>
            <div className={cn("p-6 flex items-center relative border-b border-neutral-200 dark:border-neutral-800", isCollapsed ? "justify-center" : "gap-3")}>
                <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                            src={mainWebLogo}
                            alt="CoderzLab"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    {
                        !isCollapsed && (
                            <div className="flex-1 text-left min-w-0 hidden lg:block">
                                <h1 className="font-bold text-neutral-900 dark:text-white truncate tracking-tight">CoderzLab</h1>
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate uppercase tracking-widest font-mono">
                                    Main Platform
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
                    {allRoutes.map((route) => renderNavItem(route))}
                </nav>
            </ScrollArea>
            <div className="mt-auto border-t border-neutral-200 dark:border-neutral-800">
                {/* Gamification Credits Display */}
                {
                    status === "authenticated" && (
                        <div className={cn("p-3 border-b border-neutral-200 dark:border-neutral-800", isCollapsed ? "text-center" : "")}>
                            {
                                !isCollapsed ? (
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setLevelDialogOpen(true)}>
                                            <Crown className="h-3.5 w-3.5 text-indigo-500" />
                                            <span className="text-xs font-semibold text-neutral-500 uppercase">Lvl {currentLevel}</span>
                                        </div>
                                        <Link href="/purchase" className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title="Buy Credits">
                                            <Plus className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                                        </Link>
                                    </div>
                                ) : null}
                            <div className={cn("flex items-center gap-2 group cursor-pointer", isCollapsed && "justify-center flex-col gap-1")} onClick={() => setTradeDialogOpen(true)}>
                                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                                    <Coins className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                {
                                    !isCollapsed && (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-neutral-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{credits} Credits</span>
                                            <span className="text-[10px] text-muted-foreground">{currentXp} XP</span>
                                        </div>
                                    )
                                }
                                {
                                    isCollapsed && (
                                        <span className="text-[10px] font-bold text-neutral-900 dark:text-white">{credits}</span>
                                    )
                                }
                            </div>
                        </div>
                    )
                }

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
                                                {/* Notification Content Mock */}
                                                <div className="p-4 text-center text-neutral-500 text-sm">No notifications</div>
                                                {/* Use notifications variable to shut up linter if necessary or just dummy map */}
                                                {notifications.map(n => <div key={n.id}>{n.title}</div>)}
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
                                            <button onClick={() => router.push('/profile')} className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm">
                                                <User className="h-4 w-4" />
                                                Profile
                                            </button>
                                            <button onClick={() => setReferDialogOpen(true)} className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm">
                                                <Share2 className="h-4 w-4" />
                                                Refer Friends
                                            </button>
                                            <button onClick={() => router.push('/feedback')} className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm">
                                                <MessageCircleCodeIcon className="h-4 w-4" />
                                                Feedback
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
                                onClick={() => router.push('/signin')}
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

            {/* Dialogs */}
            <Dialog open={referDialogOpen} onOpenChange={() => setReferDialogOpen(false)}>
                <DialogContent className="bg-background text-foreground border-border">
                    <DialogHeader>
                        <DialogTitle>Spread the Code, Earn the Glory</DialogTitle>
                        <DialogDescription>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Refer a friend and snag <strong>300 XP</strong> when they sign up.</li>
                                <li>Your friend gets <strong>250 XP</strong> to start their journey.</li>
                            </ul>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-4">
                        <Input value={referralLink} readOnly className="text-foreground border-border" />
                        <Button onClick={handleCopy} className="bg-primary text-primary-foreground">Copy Link</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Sheet open={tradeDialogOpen} onOpenChange={() => setTradeDialogOpen(false)}>
                <SheetContent side="right" className="w-[400px]">
                    <SheetHeader>
                        <SheetTitle>Trade XP for Credits</SheetTitle>
                        <SheetDescription>Convert your hard-earned XP into credits.</SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                        <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{currentXp}</p>
                                <p className="text-xs text-muted-foreground uppercase">XP Available</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{credits}</p>
                                <p className="text-xs text-muted-foreground uppercase">Current Credits</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>XP to Convert</span>
                                <span className="font-mono">{xpToConvert}</span>
                            </div>
                            <Slider
                                value={[xpToConvert]}
                                min={0}
                                max={maxConvertibleXp}
                                step={10}
                                onValueChange={(val) => setXpToConvert(val[0]!)}
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Rate: 10 XP = 1 Credit</span>
                                <span>You get: {creditsGained} Credits</span>
                            </div>
                        </div>

                        <Button onClick={handleConvert} disabled={converting || xpToConvert === 0} className="w-full">
                            {converting ? <Loader className="animate-spin w-4 h-4" /> : "Confirm Conversion"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={levelDialogOpen} onOpenChange={() => setLevelDialogOpen(false)}>
                <SheetContent side="right" className="w-[500px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Your Level</SheetTitle>
                        <SheetDescription>View your progress and stats.</SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        {
                            levelInfoLoading ? (
                                <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>
                            ) : levelInfo ? (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                                            <Crown className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold">Level {levelInfo.currentLevel}</h3>
                                        <p className="text-muted-foreground">{levelInfo.currentLevelConfig?.title}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Progress</span>
                                            <span>{Math.round(levelInfo.levelInfo.progressPercentage)}%</span>
                                        </div>
                                        <Progress value={levelInfo.levelInfo.progressPercentage} />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{levelInfo.currentXp} XP</span>
                                            <span>Next Level: {levelInfo.levelInfo.nextLevelXp} XP</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border bg-card text-center">
                                            <Award className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                            <div className="text-xl font-bold">{levelInfo.totalXp}</div>
                                            <div className="text-xs text-muted-foreground">Total XP</div>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-card text-center">
                                            <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                                            <div className="text-xl font-bold">{levelInfo.credits}</div>
                                            <div className="text-xs text-muted-foreground">Credits</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground">Could not load level info.</p>
                            )
                        }
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

const Sidebar = ({ className = "" }: SidebarProps) => {
    // We only use the external context now
    // If context not found, useSidebar hook inside SidebarContent will throw error which is desired behavior if wrapped improperly

    // We can't really remove the wrapping component easily if the user expects one, 
    // but the request was "local context should not be there". 
    // However, SidebarContent consumes useSidebar.
    // And Sidebar component renders SidebarContent along with the toggle button and mobile behavior.

    // The previous implementation had a "fallback" local state if external context was missing.
    // The user wants to remove that "local isCollapsed" stuff.

    // Since SidebarProvider is exported for Layout to use, Sidebar should just consume it.

    const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint consistent with other sidebars
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile sheet on resize to desktop
    useEffect(() => {
        if (!isMobile) {
            setIsMobileOpen(false);
        }
    }, [isMobile, setIsMobileOpen]);

    const content = <SidebarContent />;

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
                    isCollapsed ? "w-[90px]" : "w-64",
                    className
                )}
            >
                {content}
            </aside>
            <div className={cn(
                "fixed top-0 left-0 h-full w-64 bg-white dark:bg-neutral-950 z-50 transition-transform duration-300 transform border-r border-neutral-200 dark:border-neutral-800 lg:hidden flex flex-col",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {content}
            </div>
        </TooltipProvider>
    );
};

export default Sidebar;