"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@repo/auth/client";
import Link from "next/link";
import Image from "next/image";
import toast from "@repo/ui/components/ui/sonner";
import {
    LogOut, User, ChevronLeft, ChevronRight, ChevronDown, Coins, Crown,
    Loader, Sun, Moon, AlignLeft, Plus, LayoutDashboard, Share2,
    MessageCircleCodeIcon, Award, Zap, ArrowLeftRight, Eye,
    Trophy, TrendingUp
} from "lucide-react";
import {
    TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from "@repo/ui/components/ui/sheet";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
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
import { useSidebar } from "./sidebarprovider";
import { Label } from "@repo/ui/components/ui/label";

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
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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



    const handleProfileMouseEnter = () => {
        if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
        setProfileDropdownOpen(true);
    };

    const handleProfileMouseLeave = () => {
        if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
        profileTimeoutRef.current = setTimeout(() => setProfileDropdownOpen(false), 150);
    };

    const renderNavItem = (item: NavigationItem) => {
        const itemPath = item.path;
        const itemName = item.name;
        // Handle ReactNode icon or fallback
        const Icon = item.icon || LayoutDashboard;

        const hasChildren = item.children && item.children.length > 0;

        // Active Logic
        // For parent: check if any child is active OR if we're on the parent route itself
        const isChildActive = hasChildren && item.children!.some((child) => pathname.startsWith(`/${child.path}`));
        const isParentActive = pathname === `/${itemPath}` || pathname.startsWith(`/${itemPath}/`);
        const isExpanded = expandedItems.includes(itemPath) || ((isChildActive || isParentActive) && !isCollapsed);

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
                                                            "cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-muted-foreground cursor-not-allowed opacity-60"
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
                                                        "cursor-pointer flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
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
                    "cursor-pointer flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
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
                <Link href={session ? "/home" : "/"} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                            src="/mainlogo.png"
                            alt="CoderzLab"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    {
                        !isCollapsed && (
                            <div className="flex-1 text-left min-w-0">
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
                            className="cursor-pointer hidden lg:block absolute top-6 -right-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-50 shadow-lg"
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
                {
                    status === "authenticated" && (
                        <div className={cn(
                            "p-3 border-b border-neutral-200 dark:border-neutral-800",
                            isCollapsed ? "flex flex-col items-center gap-4 py-4" : "space-y-3"
                        )}>
                            {
                                isCollapsed ? (
                                    <>
                                        <div className="relative group cursor-pointer" onClick={() => setLevelDialogOpen(true)}>
                                            <Crown className="h-5 w-5 text-indigo-500" />
                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-indigo-500 text-[8px] text-white">
                                                {currentLevel}
                                            </span>
                                        </div>
                                        <div className="group cursor-pointer text-center" onClick={() => setTradeDialogOpen(true)}>
                                            <div className="mb-0.5 flex justify-center">
                                                <Zap className="h-4 w-4 text-amber-500" />
                                            </div>
                                            <span className="text-[9px] font-bold text-neutral-700 dark:text-neutral-300">
                                                {currentXp > 999 ? `${(currentXp / 1000).toFixed(1)}k` : currentXp}
                                            </span>
                                        </div>
                                        <Link href="/purchase" className="group text-center block">
                                            <div className="mb-0.5 flex justify-center">
                                                <Coins className="h-4 w-4 text-violet-500" />
                                            </div>
                                            <span className="text-[9px] font-bold text-neutral-700 dark:text-neutral-300">
                                                {credits > 999 ? `${(credits / 1000).toFixed(1)}k` : credits}
                                            </span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className="flex w-full justify-between items-center gap-2 px-2 py-1.5 rounded-md bg-gradient-to-r from-indigo-500/10 to-purple-500/10 cursor-pointer hover:from-indigo-500/20 hover:to-purple-500/20 transition-all border border-indigo-500/20"
                                        >
                                            <div className="flex gap-2">
                                                <div className="p-1 bg-indigo-500 rounded text-white shadow-sm">
                                                    <Crown className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 leading-none">Current Level</span>
                                                    <span className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">{currentLevel}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setLevelDialogOpen(true)}
                                                className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-md transition-colors border border-amber-200 dark:border-amber-800/50"
                                            >
                                                <Eye className="h-3 w-3" />
                                                View
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-semibold text-neutral-500 dark:text-neutral-400">Total XP</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{currentXp}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setTradeDialogOpen(true)}
                                                className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 rounded-md transition-colors border border-amber-200 dark:border-amber-800/50"
                                            >
                                                <ArrowLeftRight className="h-3 w-3" />
                                                Trade
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-semibold text-neutral-500 dark:text-neutral-400">Balance</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Coins className="h-3.5 w-3.5 text-violet-500 fill-yellow-500" />
                                                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{credits}</span>
                                                </div>
                                            </div>
                                            <Link
                                                href="/purchase"
                                                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-md transition-colors shadow-sm"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Buy
                                            </Link>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                    )
                }
                <div className={cn("p-2", isCollapsed ? "flex flex-col justify-center" : "grid grid-cols-2 gap-2")}>
                    <div className={isCollapsed ? "" : ""}>
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={cn(
                                "cursor-pointer flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full",
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
                            <NotificationsSheet isCollapsed={isCollapsed} />
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
                                        <div className="flex-1 text-left min-w-0">
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
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md md:max-w-xl p-6 border-l border-border overflow-y-auto"
                >
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold flex items-center">
                            <Award className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                            Trade XP for Credits
                        </SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            Convert your current XP into credits to unlock assessments, projects, and AI tools.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-5 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg">
                                <p className="text-sm text-muted-foreground">Current XP</p>
                                <p className="text-xl font-bold flex items-center mt-1">
                                    <Award className="h-4 w-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                                    {currentXp}
                                </p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                                <p className="text-sm text-muted-foreground">Your Credits</p>
                                <p className="text-xl font-bold flex items-center mt-1">
                                    <Coins className="h-4 w-4 mr-1 text-amber-600 dark:text-amber-400" />
                                    {credits}
                                </p>
                            </div>
                        </div>
                        <div className="py-3">
                            <Label htmlFor="xp-input" className="block mb-2 font-medium">
                                XP to convert
                            </Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="xp-input"
                                    type="number"
                                    value={xpToConvert}
                                    onChange={(e) => setXpToConvert(Math.max(0, Math.min(maxConvertibleXp, Number(e.target.value))))}
                                    min={0}
                                    max={maxConvertibleXp}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => setXpToConvert(Math.min(maxConvertibleXp, Math.floor(xpToConvert + 10)))}
                                    className="px-2"
                                >
                                    +10
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setXpToConvert(Math.max(0, Math.floor(xpToConvert / 2)))}
                                    className="px-2"
                                >
                                    ½
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setXpToConvert(maxConvertibleXp)}
                                    className="px-2"
                                >
                                    Max
                                </Button>
                            </div>
                            <Slider
                                value={[xpToConvert]}
                                min={0}
                                max={maxConvertibleXp}
                                step={10}
                                onValueChange={(value) => setXpToConvert(value[0]!)}
                                className="mt-4"
                            />
                        </div>
                        <div className="bg-muted/40 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-muted-foreground">Conversion rate</p>
                                <p className="text-sm font-medium">100 XP = 1 Credit</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">You&apos;ll receive</p>
                                <p className="text-lg font-bold flex items-center">
                                    <Coins className="h-4 w-4 mr-1 text-amber-600 dark:text-amber-400" />
                                    {creditsGained} Credits
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-muted-foreground">Remaining XP</p>
                                <p className="text-lg font-medium">{currentXp - xpToConvert} XP</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleConvert}
                            disabled={xpToConvert <= 0 || xpToConvert > maxConvertibleXp || converting}
                            className="w-full bg-primary text-primary-foreground rounded-2xl py-2"
                            size="lg"
                        >
                            {
                                converting ? (
                                    <div className="flex gap-2 items-center justify-center">
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Converting...
                                    </div>
                                ) : (
                                    "Convert XP to Credits"
                                )
                            }
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
            <Sheet open={levelDialogOpen} onOpenChange={() => setLevelDialogOpen(false)}>
                <SheetContent
                    side="right"
                    className="w-full h-full sm:w-[80vw] md:w-[55vw] sm:max-w-[80vw] p-6 overflow-y-auto"
                    style={{ maxWidth: '90vw' }}
                >
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-amber-500" />
                            Your Coding Journey
                        </SheetTitle>
                        <SheetDescription>
                            Track your progress through our leveling system and earn rewards for your achievements.
                        </SheetDescription>
                    </SheetHeader>
                    {
                        levelInfoLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                                    <p className="text-muted-foreground">Loading your progress...</p>
                                </div>
                            </div>
                        ) : levelInfo ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 bg-card rounded-xl p-2 border border-border shadow-sm">
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-2xl">{levelInfo.currentLevelConfig?.icon || "🌱"}</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{levelInfo.currentLevelConfig?.title || "Coding Newbie"}</h3>
                                                    <p className="text-sm text-muted-foreground">Level {levelInfo.currentLevel}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {levelInfo.currentLevelConfig?.description || "Welcome to your coding journey!"}
                                            </p>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span>Progress to next level</span>
                                                        <span>{Math.round(levelInfo.levelInfo.progressPercentage)}%</span>
                                                    </div>
                                                    <Progress
                                                        value={levelInfo.levelInfo.progressPercentage}
                                                        className="h-3"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                        <span>{levelInfo.levelInfo.progressInCurrentLevel} XP</span>
                                                        <span>{levelInfo.levelInfo.xpNeededForNextLevel} XP to go</span>
                                                    </div>
                                                </div>
                                                {
                                                    levelInfo.nextLevelConfig && (
                                                        <div className="bg-muted/50 p-3 rounded-lg">
                                                            <p className="text-sm font-medium mb-1">Next Level:</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{levelInfo.nextLevelConfig.icon}</span>
                                                                <div>
                                                                    <p className="font-semibold">{levelInfo.nextLevelConfig.title}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Rewards: {levelInfo.nextLevelConfig.xpReward} XP + {levelInfo.nextLevelConfig.creditsReward} Credits
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-card rounded-xl p-2 border border-border shadow-sm">
                                            <div className="p-4 text-center">
                                                <Award className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
                                                <div className="text-2xl font-bold text-indigo-600">{levelInfo.currentXp}</div>
                                                <div className="text-sm text-muted-foreground">Current XP</div>
                                            </div>
                                        </div>
                                        <div className="bg-card rounded-xl p-2 border border-border shadow-sm">
                                            <div className="p-4 text-center">
                                                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                                <div className="text-2xl font-bold text-green-600">{levelInfo.totalXp}</div>
                                                <div className="text-sm text-muted-foreground">Total XP Earned</div>
                                            </div>
                                        </div>
                                        <div className="bg-card rounded-xl p-2 border border-border shadow-sm">
                                            <div className="p-4 text-center">
                                                <Coins className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                                                <div className="text-2xl font-bold text-amber-600">{levelInfo.credits}</div>
                                                <div className="text-sm text-muted-foreground">Credits</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {
                                    levelInfo.recentLevelUps.length > 0 && (
                                        <div className="bg-card rounded-xl p-2 border border-border shadow-sm">
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Trophy className="h-5 w-5 text-amber-500" />
                                                    <h3 className="text-lg font-semibold">Recent Achievements</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    {
                                                        levelInfo.recentLevelUps.map((levelUp: LevelUpHistory, index: number) => (
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                                <span className="text-xl">{levelUp.levelInfo.icon}</span>
                                                                <div className="flex-1">
                                                                    <p className="font-medium">{levelUp.levelInfo.title}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Achieved on {new Date(levelUp.achievedAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium">+{levelUp.xpEarned} XP</p>
                                                                    {
                                                                        levelUp.creditsEarned > 0 && (
                                                                            <p className="text-sm text-amber-600">+{levelUp.creditsEarned} Credits</p>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setLevelDialogOpen(false)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setLevelDialogOpen(false);
                                            setTradeDialogOpen(true);
                                        }}
                                        className="flex-1 bg-primary text-primary-foreground rounded-2xl"
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Trade XP for Credits
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-muted-foreground">Unable to load level information.</p>
                            </div>
                        )
                    }
                </SheetContent>
            </Sheet>
        </>
    );
}

const Sidebar = ({ className = "" }: SidebarProps) => {
    const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
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
                className="fixed top-2 left-2 z-50 lg:hidden bg-white dark:bg-neutral-950 p-2 rounded-lg shadow-md"
            >
                <AlignLeft className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
            </button>
            {
                isMobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )
            }
            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300 ease-in-out",
                    "bg-neutral-100 dark:bg-black",
                    "hidden lg:flex",
                    isCollapsed ? "w-[70px]" : "w-[240px]",
                    className
                )}
            >
                {content}
            </aside>
            <div className={cn(
                "fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 transform lg:hidden flex flex-col",
                "bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {content}
            </div>
        </TooltipProvider>
    );
};

export default Sidebar;