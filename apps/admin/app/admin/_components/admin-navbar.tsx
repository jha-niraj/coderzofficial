'use client';

import { useSession } from "@repo/auth";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import {
    Bell, User, Settings, LogOut, Shield, Users, Database, TrendingUp, RefreshCw
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { getPlatformStats, getSystemHealth } from "@/actions/admin.action";
import { ThemeToggle } from "@repo/ui/components/themetoggle";

const AdminNavbar = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const { data: session } = useSession();
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const [adminStats, setAdminStats] = useState({
        activeUsers: 0,
        totalUsers: 0,
        systemHealth: 100,
        notifications: 0
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [platformStatsRes, systemHealthRes] = await Promise.all([
                    getPlatformStats('7d'),
                    getSystemHealth()
                ]);
                setAdminStats({
                    activeUsers: platformStatsRes?.success ? platformStatsRes?.data?.activeUsers || 0 : 0,
                    totalUsers: platformStatsRes?.success ? platformStatsRes?.data?.totalUsers || 0 : 0,
                    systemHealth: systemHealthRes?.success ? 100 : 0,
                    notifications: 0
                });
            } catch {
                setAdminStats({ activeUsers: 0, totalUsers: 0, systemHealth: 0, notifications: 0 });
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    const getPageTitle = () => {
        const segments = pathname.split('/').filter(Boolean);
        const currentPath = segments[segments.length - 1] || 'admin';

        const titleMap: { [key: string]: string } = {
            'admin': 'Admin Dashboard',
            'users': 'User Management',
            'job-interview': 'Job Interview Analytics',
            'bughunt': 'Bug Hunt Analytics',
            'company-wise': 'Company Mock Analytics',
            'peer-to-peer': 'Peer Mock Analytics',
            'general': 'General Mock Analytics',
            'free': 'Free Content',
            'paid': 'Paid Content',
            'coding': 'Coding Assessments',
            'technical': 'Technical Assessments',
            'analytics': 'Platform Analytics',
            'credits': 'Credits Management',
            'settings': 'Admin Settings'
        };

        return titleMap[currentPath] || currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
    };

    const handleLogout = () => {
        router.push('/signin');
    };

    return (
        <nav className={`fixed top-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300 ${scrolled ? 'shadow-sm bg-background/95' : ''} ${isCollapsed ? 'sm:left-[60px] left-[0px]' : 'sm:left-[250px] left-[0px]'}`}>
            <div className="px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <Shield className="h-5 w-5 text-red-600" />
                            </div>
                            <motion.h1
                                className="text-lg sm:text-xl font-bold text-foreground truncate"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={pathname}
                            >
                                {getPageTitle()}
                            </motion.h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-4">
                            <motion.div
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200/50 dark:border-green-800/50"
                                whileHover={{ scale: 1.02 }}
                            >
                                <Users className="h-4 w-4 text-green-600" />
                                <div className="text-sm">
                                    <span className="font-semibold text-green-700 dark:text-green-300">
                                        {adminStats.activeUsers}
                                    </span>
                                    <span className="text-muted-foreground ml-1">online</span>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50"
                                whileHover={{ scale: 1.02 }}
                            >
                                <Database className="h-4 w-4 text-blue-600" />
                                <div className="text-sm">
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                                        {adminStats.systemHealth}%
                                    </span>
                                    <span className="text-muted-foreground ml-1">uptime</span>
                                </div>
                            </motion.div>
                        </div>
                        <Button variant="ghost" size="sm" className="relative">
                            <Bell className="h-4 w-4" />
                            {
                                adminStats.notifications > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                    >
                                        {adminStats.notifications}
                                    </Badge>
                                )
                            }
                        </Button>
                        <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <ThemeToggle />
                        {
                            session && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                                            <Avatar className="h-8 w-8 border-2 border-red-500/50">
                                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Admin"} />
                                                <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold">
                                                    {session?.user?.name?.split(" ").map(n => n[0]).join("") || session?.user?.email?.[0] || "A"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <motion.div
                                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-background"
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {session?.user?.email}
                                                </p>
                                                <Badge variant="destructive" className="w-fit text-xs mt-1">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Administrator
                                                </Badge>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/analytics')}>
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            <span>Analytics</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/settings')}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Admin Settings</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem className="cursor-pointer md:hidden">
                                            <ThemeToggle />
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard')}>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Switch to User View</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            className="cursor-pointer text-red-600 dark:text-red-400"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )
                        }
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar; 