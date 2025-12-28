'use client';

import React, {
    useState, useEffect, useRef, createContext, useContext
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from '@repo/auth/client';
import Link from "next/link";
import Image from "next/image";
import toast from "@repo/ui/components/ui/sonner";
import {
    LogOut, User, Bell, BellOff, Sparkles, Brain, Briefcase, Users, Video, MessageSquare,
    Cable, Share2, MessageCircleCodeIcon, Trophy, FolderKanban, User2, Building2, ChevronLeft,
    ChevronRight, ChevronDown, Award, Coins, Crown, Menu, Loader, TrendingUp, Zap, Notebook,
    Users2
} from "lucide-react";
import {
    TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
} from "@repo/ui/components/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import mainWebLogo from "@/utils/titlelogo.png";
import { format } from "date-fns";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from "@repo/ui/components/ui/sheet";
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { FaTools } from "react-icons/fa";
import { ThemeToggle } from "@repo/ui/components/themetoggle";
import { useUserStore } from "@/app/store/useUserStore";
import { motion } from "framer-motion";
import { Slider } from "@repo/ui/components/ui/slider";
import { Label } from "@repo/ui/components/ui/label";
import { convertXpToCredits } from "@/actions/(main)/subscription/credits.action";
import { Progress } from "@repo/ui/components/ui/progress";
import { getUserReferralCode } from "@/actions/(main)/user/user.action";

// Context for sidebar state
interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobileOpen: boolean;
    isAISidebarOpen: boolean;
    setIsAISidebarOpen: (value: boolean) => void;
    setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        // Return default values if not within provider - this allows usage in layouts
        return {
            isCollapsed: false,
            setIsCollapsed: () => { },
            isMobileOpen: false,
            setIsMobileOpen: () => { },
            isAISidebarOpen: false,
            setIsAISidebarOpen: () => { },
        };
    }
    return context;
};

// Hook that throws if not within provider (for components that require the context)
export const useSidebarRequired = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebarRequired must be used within a SidebarProvider');
    }
    return context;
};

export interface Route {
    layout: string;
    path: string;
    name: string;
    icon?: React.ReactNode;
    section?: string;
    description?: string;
    status: string;
    color?: string;
    dropdownItems?: Array<{
        path: string;
        name: string;
        icon?: React.ReactNode;
        description?: string;
    }>;
}

interface SidebarProps {
    routes?: Route[];
    className?: string;
    title?: string;
    subtitle?: string;
}

interface NavDropdownProps {
    isActive: boolean;
    onNavigate: (path: string) => void;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    dropdownItems: Array<{
        path: string;
        name: string;
        icon?: React.ReactNode;
        iconColor?: string;
        description?: string;
        comingSoon?: boolean;
    }>;
}

interface Notification {
    id: string;
    title: string;
    description?: string;
    actionUrl?: string;
    read: boolean;
    createdAt: Date;
}

// AnimatePresence imported from framer-motion
import { AnimatePresence } from "framer-motion";

const NavDropdown = ({
    isActive, onNavigate, icon, label, isCollapsed, isExpanded, onToggle, dropdownItems
}: NavDropdownProps) => {
    const buttonContent = (
        <button
            onClick={onToggle}
            className={cn(
                "flex items-center rounded-lg p-2.5 text-sm font-medium transition-all cursor-pointer group w-full",
                isCollapsed ? "justify-center" : "justify-start gap-3",
                isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
        >
            <div className="h-5 w-5 flex-shrink-0">{icon}</div>
            {!isCollapsed && (
                <>
                    <span className="truncate flex-1 text-left">{label}</span>
                    <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-180"
                    )} />
                </>
            )}
        </button>
    );

    return (
        <div className="w-full">
            {
                isCollapsed ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {buttonContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                            {label}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    buttonContent
                )
            }
            <AnimatePresence>
                {
                    isExpanded && !isCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-4 mt-1 space-y-0.5"
                        >
                            {
                                dropdownItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (!item.comingSoon) {
                                                onNavigate(item.path);
                                            } else {
                                                toast.info("Coming Soon", {
                                                    description: `${item.name} feature is under development`
                                                });
                                            }
                                        }}
                                        disabled={item.comingSoon}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                                            item.comingSoon
                                                ? "text-muted-foreground cursor-not-allowed opacity-60"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        )}
                                    >
                                        <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center text-sm">
                                            {
                                                typeof item.icon === 'string' ? (
                                                    <span>{item.icon}</span>
                                                ) : (
                                                    <div className={item.iconColor}>{item.icon}</div>
                                                )
                                            }
                                        </div>
                                        <span className="font-medium text-left flex-1">{item.name}</span>
                                        {
                                            item.comingSoon && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded border border-yellow-500/20 font-semibold">
                                                    SOON
                                                </span>
                                            )
                                        }
                                    </button>
                                ))
                            }
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    );
};

// Navigation Item Component
interface NavItemProps {
    route: Route;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}

const NavItem = ({ route, isActive, isCollapsed, onClick }: NavItemProps) => {
    const content = (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center rounded-lg p-2.5 text-sm font-medium transition-all cursor-pointer group w-full",
                isCollapsed ? "justify-center" : "justify-start gap-3",
                isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
        >
            <div className="h-5 w-5 flex-shrink-0">{route.icon}</div>
            {!isCollapsed && <span className="truncate">{route.name}</span>}
        </button>
    );

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {route.name}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
};

// Sidebar Content Component (shared between desktop and mobile)
interface SidebarContentProps {
    routes: Route[];
    isCollapsed: boolean;
    onNavigate: (path: string) => void;
    onClose?: () => void;
}

const SidebarContent = ({ routes, isCollapsed, onClose }: Omit<SidebarContentProps, 'onNavigate'>) => {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
    const [notifications] = useState<Notification[]>([]);
    const [unreadCount] = useState(0);
    const [referDialogOpen, setReferDialogOpen] = useState(false);
    const [referralLink, setReferralLink] = useState("");
    const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const notificationsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Expanded dropdown state for accordion behavior
    const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

    const {
        currentXp, credits, currentLevel, fetchCreditsAndXp, addCredits,
        updateXp, totalXp
    } = useUserStore();

    const [xpToConvert, setXpToConvert] = useState(0);
    const conversionRate = 10;
    const creditsGained = Math.floor(xpToConvert / conversionRate);
    const [maxConvertibleXp] = useState(currentXp);
    const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
    const [levelDialogOpen, setLevelDialogOpen] = useState(false);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            fetchCreditsAndXp();
        }
    }, [status, fetchCreditsAndXp]);

    const isActiveRoute = (path: string) => pathname.includes(path);
    const displayRoutes = routes.filter((route) => route.status !== "coming");

    const handleNavigation = (path: string) => {
        router.push(`/${path}`);
        onClose?.();
    };

    const handleLinkClick = (href: string) => {
        setProfileDropdownOpen(false);
        router.push(`/${href}`);
        onClose?.();
    };

    // Toggle dropdown with accordion behavior (only one open at a time)
    const toggleDropdown = (dropdownName: string) => {
        setExpandedDropdown(prev => prev === dropdownName ? null : dropdownName);
    };

    // Check if specific routes are active
    const isAiActive = pathname.includes('/ai');
    const isProjectsActive = pathname.includes('/projects');
    const isToolsActive = pathname.includes('/tools') || pathname.includes('/products');
    const isMockActive = pathname.includes('/mock') || pathname.includes('/peertopeer');

    // Dropdown items data
    const projectsDropdown = [
        { path: 'projects', name: 'Projects', icon: "🚀", iconColor: 'text-green-400' },
        { path: 'projects/generate', name: 'Generate Project', icon: <Sparkles className="w-4 h-4" />, iconColor: 'text-blue-400' },
        { path: 'projects/myprojects', name: 'My Projects', icon: <User className="w-4 h-4" />, iconColor: 'text-yellow-400' },
        { path: 'projects/allprojects', name: 'All Projects', icon: <User2 className="w-4 h-4" />, iconColor: 'text-yellow-400' }
    ];

    const aiDropdown = [
        { path: 'ai/jobinterviewassistant', name: 'Job Interview', icon: <Briefcase className="w-4 h-4" />, iconColor: 'text-blue-400' },
    ];

    const toolsDropdown = [
        { path: 'products', name: 'Products', icon: <FaTools className="w-4 h-4" />, iconColor: 'text-green-400' },
        { path: 'collective', name: 'Collective', icon: <Trophy className="w-4 h-4" />, iconColor: 'text-green-400', comingSoon: true }
    ];

    const mockDropdown = [
        { path: 'mock', name: 'Mock Interview', icon: <Brain className="w-4 h-4" />, iconColor: 'text-blue-400' },
        { path: 'mock/voice', name: 'Voice Mock', icon: <Brain className="w-4 h-4" />, iconColor: 'text-blue-400', comingSoon: true },
        { path: 'mock/video', name: 'AI Video Mock', icon: <Video className="w-4 h-4" />, iconColor: 'text-purple-400', comingSoon: true },
        { path: 'mock/peertopeer', name: 'Peer to Peer Mock', icon: <MessageSquare className="w-4 h-4" />, iconColor: 'text-yellow-400', comingSoon: true },
        { path: 'mock/companywise', name: 'Company Wise Mock', icon: <Building2 className="w-4 h-4" />, iconColor: 'text-green-400', comingSoon: true },
        { path: 'mock/connect', name: 'Connect', icon: <Cable className="w-4 h-4" />, iconColor: 'text-orange-400', comingSoon: true }
    ];

    // Fetch referral code
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

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        toast("Link Copied!", { description: "Go spread the word, champ." });
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

    const handleConvert = async () => {
        if (xpToConvert <= 0 || xpToConvert > currentXp) {
            toast("Oops!", {
                description: "Check your XP amount—can't trade what you don't have!",
            });
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

            toast("Trade Successful!", {
                description: `You've turned ${xpToConvert} XP into ${creditsGained} credits. Nice move!`,
            });
        } catch (err) {
            console.log("Failed to trade the xp to the credits" + err);
        } finally {
            setTradeDialogOpen(false);
            setConverting(false);
            setXpToConvert(0);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className={cn(
                "border-b border-border p-3",
                isCollapsed ? "flex justify-center" : ""
            )}>
                {
                    status === "authenticated" && session ? (
                        <div className={cn(
                            "flex items-center",
                            isCollapsed ? "justify-center" : "gap-3"
                        )}>
                            {
                                session?.user?.image ? (
                                    <Image
                                        className={cn("rounded-full flex-shrink-0", isCollapsed ? "h-9 w-9" : "h-10 w-10")}
                                        src={session.user.image}
                                        alt={`Profile picture of ${session.user.name || 'user'}`}
                                        width={40}
                                        height={40}
                                    />
                                ) : (
                                    <div className={cn(
                                        "rounded-full bg-primary flex items-center justify-center flex-shrink-0",
                                        isCollapsed ? "h-9 w-9" : "h-10 w-10"
                                    )}>
                                        <span className="text-primary-foreground text-sm font-semibold">
                                            {session?.user?.name?.[0] || 'U'}
                                        </span>
                                    </div>
                                )
                            }
                            {
                                !isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm text-foreground truncate">
                                            {session?.user?.name || 'User'}
                                        </h3>
                                        <p className="text-xs text-muted-foreground truncate">
                                            @{(session?.user as { username?: string })?.username || 'username'}
                                        </p>
                                    </div>
                                )
                            }
                        </div>
                    ) : (
                        <Link href={session ? "/dashboard" : "/"} className="transition-opacity hover:opacity-80 flex justify-center">
                            <div className="relative h-9 w-9">
                                <Image
                                    src={mainWebLogo}
                                    alt="CoderzLab"
                                    width={36}
                                    height={36}
                                    className="object-contain rounded-lg"
                                    priority
                                />
                            </div>
                        </Link>
                    )
                }
            </div>
            {
                status === "authenticated" && !isCollapsed && (
                    <div className="p-3 border-b border-border space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 flex-1">
                                <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-xs">
                                    {currentXp} XP
                                </span>
                                <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 ml-auto">
                                    <Crown className="h-3 w-3" />
                                    <span>Lvl {currentLevel}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                            <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="font-semibold text-amber-700 dark:text-amber-300 text-xs">
                                {credits} Credits
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-2 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded text-xs font-medium ml-auto"
                                onClick={() => {
                                    router.push('/purchase');
                                    onClose?.();
                                }}
                            >
                                Buy
                            </Button>
                        </div>
                    </div>
                )
            }
            {
                status === "authenticated" && isCollapsed && (
                    <div className="p-2 border-b border-border space-y-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => router.push('/purchase')}
                                    className="w-full flex justify-center p-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                    <div className="flex flex-col items-center">
                                        <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        <span className="text-[10px] text-muted-foreground mt-0.5">{credits}</span>
                                    </div>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Credits: {credits}</TooltipContent>
                        </Tooltip>
                    </div>
                )
            }
            <div className="flex-grow overflow-y-auto py-3 px-2">
                <div className="flex flex-col space-y-1">
                    {
                        displayRoutes.map((route, index) => {
                            const isActive = isActiveRoute(route.path);
                            return (
                                <NavItem
                                    key={index}
                                    route={route}
                                    isActive={isActive}
                                    isCollapsed={isCollapsed}
                                    onClick={() => handleNavigation(route.path)}
                                />
                            );
                        })
                    }
                    <NavItem
                        route={{
                            layout: "main",
                            path: "studio",
                            name: "Studio",
                            icon: <Notebook className="h-5 w-5" />,
                            status: "active"
                        }}
                        isActive={pathname.includes('/studio')}
                        isCollapsed={isCollapsed}
                        onClick={() => handleNavigation('studio')}
                    />
                    <NavItem
                        route={{
                            layout: "main",
                            path: "communities",
                            name: "Communities",
                            icon: <Users2 className="h-5 w-5" />,
                            status: "active"
                        }}
                        isActive={pathname.includes('/communities')}
                        isCollapsed={isCollapsed}
                        onClick={() => handleNavigation('communities')}
                    />
                    <NavItem
                        route={{
                            layout: "main",
                            path: "chat",
                            name: "Chat",
                            icon: <MessageSquare className="h-5 w-5" />,
                            status: "active"
                        }}
                        isActive={pathname.includes('/chat')}
                        isCollapsed={isCollapsed}
                        onClick={() => handleNavigation('chat')}
                    />
                    <NavDropdown
                        isActive={isProjectsActive}
                        onNavigate={handleNavigation}
                        icon={<FolderKanban className="h-5 w-5" />}
                        label="Projects"
                        isCollapsed={isCollapsed}
                        isExpanded={expandedDropdown === 'projects'}
                        onToggle={() => toggleDropdown('projects')}
                        dropdownItems={projectsDropdown}
                    />
                    <NavDropdown
                        isActive={isAiActive}
                        onNavigate={handleNavigation}
                        icon={<Sparkles className="h-5 w-5" />}
                        label="AI Tools"
                        isCollapsed={isCollapsed}
                        isExpanded={expandedDropdown === 'ai'}
                        onToggle={() => toggleDropdown('ai')}
                        dropdownItems={aiDropdown}
                    />
                    <NavDropdown
                        isActive={isToolsActive}
                        onNavigate={handleNavigation}
                        icon={<Users className="h-5 w-5" />}
                        label="Products"
                        isCollapsed={isCollapsed}
                        isExpanded={expandedDropdown === 'products'}
                        onToggle={() => toggleDropdown('products')}
                        dropdownItems={toolsDropdown}
                    />
                    <NavDropdown
                        isActive={isMockActive}
                        onNavigate={handleNavigation}
                        icon={<Video className="h-5 w-5" />}
                        label="Mock"
                        isCollapsed={isCollapsed}
                        isExpanded={expandedDropdown === 'mock'}
                        onToggle={() => toggleDropdown('mock')}
                        dropdownItems={mockDropdown}
                    />
                </div>
            </div>
            <div className={cn("px-2 pb-3 pt-2 border-t border-border mt-auto space-y-1")}>
                <div className={cn("flex", isCollapsed ? "justify-center" : "justify-start px-1")}>
                    <ThemeToggle />
                </div>
                {
                    isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => { router.push("/feedback"); onClose?.(); }}
                                    className="flex items-center justify-center w-full rounded-lg p-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent"
                                >
                                    <MessageCircleCodeIcon className="h-5 w-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Feedback</TooltipContent>
                        </Tooltip>
                    ) : (
                        <button
                            onClick={() => { router.push("/feedback"); onClose?.(); }}
                            className="flex items-center gap-3 w-full rounded-lg p-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent"
                        >
                            <MessageCircleCodeIcon className="h-5 w-5" />
                            <span>Feedback</span>
                        </button>
                    )
                }
                {
                    status === "authenticated" && session && (
                        isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setReferDialogOpen(true)}
                                        className="flex items-center justify-center w-full rounded-lg p-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent"
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Refer Friends</TooltipContent>
                            </Tooltip>
                        ) : (
                            <button
                                onClick={() => setReferDialogOpen(true)}
                                className="flex items-center gap-3 w-full rounded-lg p-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent"
                            >
                                <Share2 className="h-5 w-5" />
                                <span>Refer Friends</span>
                            </button>
                        )
                    )
                }
                {
                    status === "authenticated" && session && (
                        <div
                            className="relative"
                            onMouseEnter={handleNotificationsMouseEnter}
                            onMouseLeave={handleNotificationsMouseLeave}
                        >
                            {
                                isCollapsed ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="relative flex items-center justify-center w-full rounded-lg p-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent">
                                                <Bell className="h-5 w-5" />
                                                {
                                                    unreadCount > 0 && (
                                                        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-semibold">
                                                            {unreadCount > 9 ? "9+" : unreadCount}
                                                        </span>
                                                    )
                                                }
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">Notifications</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <button className="relative flex items-center gap-3 w-full rounded-lg p-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent">
                                        <Bell className="h-5 w-5" />
                                        <span>Notifications</span>
                                        {
                                            unreadCount > 0 && (
                                                <span className="ml-auto h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-semibold">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                            )
                                        }
                                    </button>
                                )
                            }
                            {
                                notificationsDropdownOpen && (
                                    <div
                                        className="absolute left-full ml-2 bottom-0 bg-popover border border-border rounded-lg shadow-xl z-50 w-80 max-h-96 overflow-hidden"
                                        onMouseEnter={handleNotificationsMouseEnter}
                                        onMouseLeave={handleNotificationsMouseLeave}
                                    >
                                        <div className="p-3 border-b border-border">
                                            <h3 className="font-semibold text-foreground">Notifications</h3>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {
                                                notifications.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                                        <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
                                                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="p-2">
                                                        {
                                                            notifications.map((notification) => (
                                                                <button
                                                                    key={notification.id}
                                                                    onClick={() => {
                                                                        if (notification.actionUrl) {
                                                                            router.push(notification.actionUrl);
                                                                        }
                                                                        setNotificationsDropdownOpen(false);
                                                                        onClose?.();
                                                                    }}
                                                                    className={cn(
                                                                        "w-full text-left p-3 rounded-md transition-colors mb-2",
                                                                        !notification.read
                                                                            ? "bg-blue-500/10 hover:bg-blue-500/20 border-l-2 border-l-blue-500"
                                                                            : "hover:bg-accent"
                                                                    )}
                                                                >
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="font-medium text-sm text-foreground">{notification.title}</p>
                                                                            {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                                                        </div>
                                                                        {
                                                                            notification.description && (
                                                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                                                    {notification.description}
                                                                                </p>
                                                                            )
                                                                        }
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div className="p-2 border-t border-border">
                                            <button
                                                onClick={() => handleLinkClick('notifications')}
                                                className="w-full text-center py-2 text-sm text-primary hover:text-primary/80 font-medium"
                                            >
                                                View All Notifications
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    status === "authenticated" && session ? (
                        <div
                            className="relative"
                            onMouseEnter={handleProfileMouseEnter}
                            onMouseLeave={handleProfileMouseLeave}
                        >
                            {
                                isCollapsed ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="flex items-center justify-center w-full rounded-lg p-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent">
                                                {
                                                    session?.user?.image ? (
                                                        <Image
                                                            className="h-7 w-7 rounded-full"
                                                            src={session.user.image}
                                                            alt={`Profile picture of ${session.user.name || 'user'}`}
                                                            width={28}
                                                            height={28}
                                                        />
                                                    ) : (
                                                        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                                                            <span className="text-primary-foreground text-xs font-semibold">
                                                                {session?.user?.name?.[0] || 'U'}
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">Profile</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <button className="flex items-center gap-3 w-full rounded-lg p-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent">
                                        {
                                            session?.user?.image ? (
                                                <Image
                                                    className="h-7 w-7 rounded-full"
                                                    src={session.user.image}
                                                    alt={`Profile picture of ${session.user.name || 'user'}`}
                                                    width={28}
                                                    height={28}
                                                />
                                            ) : (
                                                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                                                    <span className="text-primary-foreground text-xs font-semibold">
                                                        {session?.user?.name?.[0] || 'U'}
                                                    </span>
                                                </div>
                                            )
                                        }
                                        <span>Profile</span>
                                    </button>
                                )
                            }
                            {
                                profileDropdownOpen && (
                                    <div
                                        className="absolute left-full ml-2 bottom-0 bg-popover border border-border rounded-lg shadow-xl z-50 w-64 overflow-hidden"
                                        onMouseEnter={handleProfileMouseEnter}
                                        onMouseLeave={handleProfileMouseLeave}
                                    >
                                        <div className="p-4 border-b border-border">
                                            <div className="flex items-center gap-3">
                                                {
                                                    session?.user?.image ? (
                                                        <Image
                                                            className="h-12 w-12 rounded-full"
                                                            src={session.user.image}
                                                            alt={`Profile picture of ${session.user.name || 'user'}`}
                                                            width={48}
                                                            height={48}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                                                            <span className="text-primary-foreground text-lg font-semibold">
                                                                {session?.user?.name?.[0] || 'U'}
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm text-foreground truncate">
                                                        {session?.user?.name || 'User'}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {session?.user?.email || 'user@example.com'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => handleLinkClick('profile')}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <span className="font-medium">Profile</span>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    await signOut({ callbackUrl: "/" });
                                                    setProfileDropdownOpen(false);
                                                    toast.success("Logged out successfully");
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                                                    <LogOut className="w-4 h-4 text-red-500" />
                                                </div>
                                                <span className="font-medium">Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    ) : (
                        isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => router.push('/signin')}
                                        className="flex items-center justify-center w-full rounded-lg p-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent"
                                    >
                                        <User className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Sign In</TooltipContent>
                            </Tooltip>
                        ) : (
                            <button
                                onClick={() => router.push('/signin')}
                                className="flex items-center gap-3 w-full rounded-lg p-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent"
                            >
                                <User className="h-5 w-5" />
                                <span>Sign In</span>
                            </button>
                        )
                    )
                }
            </div>
            <Dialog open={referDialogOpen} onOpenChange={() => setReferDialogOpen(false)}>
                <DialogContent className="bg-background text-foreground border-border">
                    <DialogHeader>
                        <DialogTitle>Spread the Code, Earn the Glory</DialogTitle>
                        <DialogDescription>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    Refer a friend and snag <strong>300 XP</strong> when they sign up—because who doesn&apos;t love free points?
                                </li>
                                <li>
                                    Your friend gets <strong>250 XP</strong> to start their journey—guess you&apos;re the generous type, huh?
                                </li>
                                <li>
                                    The more, the merrier: rack up referrals and trade XP for credits later. Easy, right?
                                </li>
                            </ul>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-4">
                        <Input value={referralLink} readOnly className="text-foreground border-border" />
                        <Button onClick={handleCopy} className="bg-primary text-primary-foreground">Copy Link</Button>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">Track your referral wins and see detailed stats</p>
                        <Button
                            onClick={() => { setReferDialogOpen(false); router.push('/referrals'); }}
                            variant="outline"
                            className="gap-2"
                        >
                            <Trophy className="w-4 h-4" />
                            View Tracking
                        </Button>
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
                                onValueChange={(value: number[]) => setXpToConvert(value[0] as number)}
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
                                                        levelInfo.recentLevelUps.map((levelUp: any, index: number) => (
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
        </div>
    );
};

// Main Sidebar Component
const Sidebar = ({ routes = [], className = "" }: SidebarProps) => {
    // Check if we're inside an external SidebarProvider
    const externalContext = useContext(SidebarContext);

    // Local state for when not inside a provider
    const [localIsCollapsed, setLocalIsCollapsed] = useState(false);
    const [localIsMobileOpen, setLocalIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Use external context if available, otherwise use local state
    const isCollapsed = externalContext ? externalContext.isCollapsed : localIsCollapsed;
    const setIsCollapsed = externalContext ? externalContext.setIsCollapsed : setLocalIsCollapsed;
    const isMobileOpen = externalContext ? externalContext.isMobileOpen : localIsMobileOpen;
    const setIsMobileOpen = externalContext ? externalContext.setIsMobileOpen : setLocalIsMobileOpen;

    // Detect mobile breakpoint
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
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

    const sidebarContent = (
        <TooltipProvider delayDuration={0}>
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-3 left-3 z-50 md:hidden bg-background text-foreground p-2 rounded-lg border border-border hover:bg-accent transition-all shadow-sm"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="w-[280px] p-0 border-r border-border">
                    <div className="h-full">
                        <SidebarContent
                            routes={routes}
                            isCollapsed={false}
                            onNavigate={() => { }}
                            onClose={() => setIsMobileOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
            <motion.div
                initial={false}
                animate={{ width: isCollapsed ? 70 : 200 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={cn(
                    "fixed top-0 left-0 h-full bg-background border-r border-border z-40 hidden md:flex flex-col",
                    className
                )}
            >
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {
                        isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )
                    }
                </button>
                <SidebarContent
                    routes={routes}
                    isCollapsed={isCollapsed}
                    onNavigate={() => { }}
                />
            </motion.div>
        </TooltipProvider>
    );

    // If we already have an external provider, don't wrap in another provider
    if (externalContext) {
        return sidebarContent;
    }

    // Otherwise, provide our own context
    return (
        <SidebarContext.Provider value={{
            isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen,
            isAISidebarOpen: false, setIsAISidebarOpen: () => { }
        }}>
            {sidebarContent}
        </SidebarContext.Provider>
    );
};

// Exported SidebarProvider for use in layouts
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isAISidebarOpen, setIsAISidebarOpen] = useState(false)

    return (
        <SidebarContext.Provider value={{
            isCollapsed, setIsCollapsed, isMobileOpen,
            setIsMobileOpen, isAISidebarOpen, setIsAISidebarOpen
        }}>
            {children}
        </SidebarContext.Provider>
    );
};

export default Sidebar;