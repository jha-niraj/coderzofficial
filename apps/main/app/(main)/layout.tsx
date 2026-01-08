'use client'

import React from 'react';
import Script from 'next/script';
import { usePathname } from "next/navigation";
import Sidebar from '@/components/common/mainsidebar';
import {
    useSidebar, SidebarProvider
} from '@/components/common/sidebarprovider';
import { WifiOff, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@repo/ui/lib/utils';
import { AIChat } from '@/components/main/aichat';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';

interface LayoutProps {
    children: React.ReactNode
}

// Inner layout component that uses the sidebar context
const MainContent = ({ children }: { children: React.ReactNode }) => {
    const { isCollapsed, isAISidebarOpen } = useSidebar();

    return (
        <>
            <Sidebar />
            <div className="flex flex-col flex-1 h-screen overflow-hidden bg-neutral-100 dark:bg-black transition-colors duration-300">
                <main className={cn(
                    "h-full relative transition-all duration-300 ease-in-out",
                    "ml-0",
                    isCollapsed ? "lg:ml-[70px]" : "lg:ml-[240px]",
                    isAISidebarOpen ? "lg:mr-[400px]" : "lg:mr-0"
                )}>
                    <div className="p-2 h-full w-full bg-white dark:bg-neutral-950 lg:rounded-l-3xl lg:border-l border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden relative">
                        <ScrollArea className="h-full w-full">
                            <div className="min-h-full w-full">
                                {children}
                            </div>
                        </ScrollArea>
                    </div>
                </main>
            </div>
            <AIChat />
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
                onLoad={() => console.log('Razorpay script loaded')}
            />
        </>
    );
};

const Layout = ({ children }: LayoutProps) => {
    const pathname = usePathname();

    // Define paths where sidebar and navbar should be hidden (full-screen mode)
    const fullScreenPaths = [
        '/ai/jobinterviewassistant/[slug]/codingquestions',
        // Add more paths here as needed
        // '/mock/[slug]/practice',
        // '/assessments/[slug]/exam',
    ];

    // Check if current path should be in full-screen mode
    const isFullScreenMode = fullScreenPaths.some(path => {
        // Convert dynamic route patterns to regex
        const pattern = path.replace(/\[.*?\]/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(pathname);
    });

    const isOnline = useNetworkStatus();

    if (!isOnline) return <OfflineFallback />;

    // If in full-screen mode, render children without sidebar and navbar
    if (isFullScreenMode) {
        return (
            <div className="h-screen w-screen bg-neutral-950 overflow-hidden">
                <ScrollArea className="h-full w-full">
                    {children}
                </ScrollArea>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-neutral-100 dark:bg-black overflow-hidden">
                <MainContent>{children}</MainContent>
            </div>
        </SidebarProvider>
    );
};

const OfflineFallback = () => {
    const handleRefresh = () => window.location.reload();

    return (
        <div className="h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 100 }}
                    transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 100 }}
                    className="bg-gradient-to-br from-primary/10 via-primary/5 to-background backdrop-blur-xl rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center border border-border"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        className="flex justify-center mb-6"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                            <WifiOff className="w-8 h-8 text-primary" />
                        </div>
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-3 text-foreground">
                        Connection Lost
                    </h2>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        Your internet connection seems to have wandered off. Check your connection and let&apos;s get back to building amazing portfolios.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </motion.button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Layout;