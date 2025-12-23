'use client';

import { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import {
    ChevronRight, Shield, Star, MountainSnow
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import mainWebLogo from "@/utils/titlelogo.png";

export interface AdminRoute {
    path: string;
    name: string;
    icon?: React.ReactNode;
    status: string;
    isParent?: boolean;
    children?: AdminRoute[];
}

interface AdminSidebarProps {
    routes?: AdminRoute[];
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const AdminSidebar = ({ routes = [], isCollapsed, toggleSidebar }: AdminSidebarProps) => {
    const { theme } = useTheme();
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const isActiveRoute = useCallback((path: string) => {
        if (path === 'admin') {
            return pathname === '/admin' || pathname === '/admin/';
        }
        return pathname.includes(path);
    }, [pathname]);

    const toggleExpanded = useCallback((path: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    }, []);

    const handleNavigation = useCallback((path: string, hasChildren?: boolean) => {
        if (hasChildren && !isCollapsed) {
            toggleExpanded(path);
        } else if (!hasChildren) {
            router.push(`/${path}`);
        }
    }, [router, toggleExpanded, isCollapsed]);

    return (
        <TooltipProvider>
            <motion.div
                className="fixed top-0 left-0 h-full bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-red-950/20 dark:to-orange-950/20 backdrop-blur-xl border-r border-border/20 shadow-2xl z-20 sm:block hidden"
                animate={{ width: isCollapsed ? 60 : 250 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center p-4 h-[80px] border-b border-border/50">
                        <Link href="/admin" className="flex gap-2 items-center justify-center group cursor-pointer">
                            <div className="relative">
                                <Image
                                    src={mainWebLogo}
                                    alt="Admin Panel"
                                    width={40}
                                    height={40}
                                    className="rounded-xl"
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
                                    <Shield className="h-2 w-2 text-white" />
                                </div>
                            </div>
                            <motion.div
                                animate={{
                                    opacity: isCollapsed ? 0 : 1,
                                    x: isCollapsed ? -20 : 0,
                                    width: isCollapsed ? 0 : "auto"
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                            >
                                <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent whitespace-nowrap">
                                    Admin Panel
                                </h1>
                            </motion.div>
                        </Link>
                    </div>
                    <div className="flex-grow overflow-y-auto py-4">
                        <div className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
                            <motion.div
                                animate={{
                                    opacity: isCollapsed ? 0 : 1,
                                    height: isCollapsed ? 0 : "auto"
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                                className="px-3 mb-3"
                            >
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                                    <Star className="h-3 w-3 text-red-500" />
                                    Admin Controls
                                </p>
                            </motion.div>
                            <AdminSidebarLinks
                                routes={routes}
                                collapsed={isCollapsed}
                                isActiveRoute={isActiveRoute}
                                expandedItems={expandedItems}
                                toggleExpanded={toggleExpanded}
                                handleNavigation={handleNavigation}
                            />
                        </div>
                    </div>
                    <motion.button
                        onClick={toggleSidebar}
                        className="absolute top-1/2 -translate-y-1/2 -right-4 p-2 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 z-30 cursor-pointer"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                    {
                        session && (
                            <div className="border-t border-border/50 p-3 mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-white" />
                                    </div>
                                    <motion.div
                                        animate={{
                                            opacity: isCollapsed ? 0 : 1,
                                            width: isCollapsed ? 0 : "auto"
                                        }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        style={{ overflow: "hidden" }}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground whitespace-nowrap">
                                                {session.user?.name}
                                            </span>
                                            <Badge variant="destructive" className="w-fit text-xs">
                                                Admin
                                            </Badge>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </motion.div>
        </TooltipProvider>
    );
};

interface AdminSidebarLinksProps {
    routes: AdminRoute[];
    collapsed: boolean;
    isActiveRoute: (path: string) => boolean;
    expandedItems: Set<string>;
    toggleExpanded: (path: string) => void;
    handleNavigation: (path: string, hasChildren?: boolean) => void;
}

const AdminSidebarLinks = ({
    routes,
    collapsed,
    isActiveRoute,
    expandedItems,
    toggleExpanded,
    handleNavigation
}: AdminSidebarLinksProps) => {
    return (
        <div className="space-y-1">
            {
                routes.map((route, index) => {
                    const isActive = isActiveRoute(route.path);
                    const isExpanded = expandedItems.has(route.path);
                    const hasChildren = route.children && route.children.length > 0;

                    return (
                        <div key={index} className="w-full">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.button
                                        onClick={() => handleNavigation(route.path, hasChildren)}
                                        className="block w-full cursor-pointer"
                                        whileHover={{ x: collapsed ? 0 : 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        <div className={cn(
                                            "flex items-center rounded-xl transition-all duration-200 cursor-pointer group relative overflow-hidden",
                                            isActive
                                                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25"
                                                : "hover:bg-muted/70 text-foreground",
                                            collapsed ? "justify-center px-3 py-3" : "px-3 py-2.5"
                                        )}>
                                            {
                                                isActive && (
                                                    <motion.div
                                                        layoutId="adminActiveBackground"
                                                        className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl"
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )
                                            }
                                            {
                                                collapsed ? (
                                                    <div className="relative z-10 flex items-center justify-center">
                                                        <div className={cn(
                                                            "transition-transform duration-200",
                                                            isActive ? 'scale-110' : 'group-hover:scale-105'
                                                        )}>
                                                            {route.icon}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 relative z-10 w-full">
                                                        <div className={cn(
                                                            "transition-transform duration-200 flex-shrink-0",
                                                            isActive ? 'scale-110' : 'group-hover:scale-105'
                                                        )}>
                                                            {route.icon}
                                                        </div>
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="text-sm text-left font-medium truncate flex-1"
                                                        >
                                                            {route.name}
                                                        </motion.span>
                                                        {
                                                            hasChildren && (
                                                                <motion.div
                                                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </motion.div>
                                                            )
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </motion.button>
                                </TooltipTrigger>
                                {
                                    collapsed && (
                                        <TooltipContent side='right'>
                                            <p>{route.name}</p>
                                        </TooltipContent>
                                    )
                                }
                            </Tooltip>
                            {
                                hasChildren && !collapsed && (
                                    <AnimatePresence>
                                        {
                                            isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-6 mt-1 space-y-1"
                                                >
                                                    {
                                                        route.children?.map((child, childIndex) => {
                                                            const isChildActive = isActiveRoute(child.path);
                                                            return (
                                                                <motion.button
                                                                    key={childIndex}
                                                                    onClick={() => handleNavigation(child.path)}
                                                                    className="block w-full cursor-pointer"
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: childIndex * 0.05 }}
                                                                >
                                                                    <div className={cn(
                                                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group",
                                                                        isChildActive
                                                                            ? "bg-gradient-to-r from-red-400/20 to-orange-400/20 border border-red-300/30 text-red-700 dark:text-red-300"
                                                                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                                                    )}>
                                                                        <div className={cn(
                                                                            "transition-transform duration-200",
                                                                            isChildActive ? 'scale-110' : 'group-hover:scale-105'
                                                                        )}>
                                                                            {child.icon}
                                                                        </div>
                                                                        <span className="text-sm text-left font-medium truncate">
                                                                            {child.name}
                                                                        </span>
                                                                    </div>
                                                                </motion.button>
                                                            );
                                                        })
                                                    }
                                                </motion.div>
                                            )
                                        }
                                    </AnimatePresence>
                                )
                            }
                        </div>
                    );
                })
            }
        </div>
    );
};

export default AdminSidebar; 