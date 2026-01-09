"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@repo/ui/components/ui/badge';
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar';
import {
    Users, Eye, Calendar, Lock, Globe, Shield, BookOpen,
    GitBranch, ArrowRight
} from 'lucide-react';
import type { SpaceFromDB } from '@/types/space';
import {
    SpaceVisibility, SpaceCategory
} from '@repo/prisma/client';
import { cn } from '@repo/ui/lib/utils';

interface SpaceCardProps {
    space: SpaceFromDB;
    index?: number;
    variant?: 'default' | 'compact' | 'featured';
    showCreator?: boolean;
}

const categoryGradients: Record<SpaceCategory, string> = {
    FRONTEND: 'from-cyan-500 to-blue-600',
    BACKEND: 'from-emerald-500 to-teal-600',
    FULLSTACK: 'from-violet-500 to-purple-600',
    DSA: 'from-amber-500 to-orange-600',
    SYSTEM_DESIGN: 'from-rose-500 to-pink-600',
    AI_ML: 'from-fuchsia-500 to-purple-600',
    DEVOPS: 'from-indigo-500 to-blue-600',
    MOBILE: 'from-green-500 to-emerald-600',
    DATABASE: 'from-slate-500 to-gray-600',
    SECURITY: 'from-red-500 to-rose-600',
    BLOCKCHAIN: 'from-yellow-500 to-amber-600',
    CLOUD: 'from-sky-500 to-cyan-600',
    INTERVIEW_PREP: 'from-lime-500 to-green-600',
    PROJECT_BASED: 'from-orange-500 to-red-600',
    CAREER: 'from-blue-500 to-indigo-600',
    GENERAL: 'from-gray-500 to-slate-600',
    OTHER: 'from-neutral-500 to-gray-600',
};

const categoryEmojis: Record<SpaceCategory, string> = {
    FRONTEND: '🎨',
    BACKEND: '⚙️',
    FULLSTACK: '🚀',
    DSA: '🧮',
    SYSTEM_DESIGN: '🏗️',
    AI_ML: '🤖',
    DEVOPS: '🔧',
    MOBILE: '📱',
    DATABASE: '🗄️',
    SECURITY: '🔒',
    BLOCKCHAIN: '⛓️',
    CLOUD: '☁️',
    INTERVIEW_PREP: '💼',
    PROJECT_BASED: '🎯',
    CAREER: '📈',
    GENERAL: '📚',
    OTHER: '✨',
};

export default function SpaceCard({ space, index = 0, variant = 'default', showCreator = true }: SpaceCardProps) {
    const gradient = categoryGradients[space.category] || categoryGradients.OTHER;
    const emoji = space.emoji || categoryEmojis[space.category] || '🚀';

    if (variant === 'compact') {
        return (
            <Link href={`/space/${space.slug}`}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group relative bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br",
                            gradient
                        )}>
                            {emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {space.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Users className="w-3 h-3" />
                                <span>{space.memberCount}</span>
                                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                <BookOpen className="w-3 h-3" />
                                <span>{space.totalSteps}</span>
                            </div>
                        </div>
                        <VisibilityIcon visibility={space.visibility} />
                    </div>
                </motion.div>
            </Link>
        );
    }

    if (variant === 'featured') {
        return (
            <Link href={`/space/${space.slug}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer"
                >
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-90",
                        gradient
                    )} />
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                    </div>
                    <div className="relative p-6 text-white min-h-[200px] flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="text-4xl">{emoji}</div>
                            <VisibilityBadge visibility={space.visibility} light />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-4">
                            {space.title}
                        </h3>
                        <p className="text-white/80 text-sm line-clamp-2 mb-4 flex-1">
                            {space.description || 'Start your learning journey here'}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-white/90">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{space.memberCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{space.totalSteps} steps</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                                Explore
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>
        );
    }

    // Default variant
    return (
        <Link href={`/space/${space.slug}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -4 }}
                className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-transparent hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300 cursor-pointer"
            >
                <div className={cn(
                    "h-2 bg-gradient-to-r",
                    gradient
                )} />
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg",
                                gradient
                            )}>
                                {emoji}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                    {space.title}
                                </h3>
                                <Badge variant="secondary" className="text-xs mt-1">
                                    {formatCategory(space.category)}
                                </Badge>
                            </div>
                        </div>
                        <VisibilityBadge visibility={space.visibility} />
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-4 min-h-[40px]">
                        {space.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-500 mb-4">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{space.memberCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            <span className="font-medium">{space.totalSteps}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">{space.viewCount}</span>
                        </div>
                        {
                            space.enableBranches && (
                                <div className="flex items-center gap-1.5">
                                    <GitBranch className="w-4 h-4" />
                                    <span className="font-medium">{space.totalBranches}</span>
                                </div>
                            )
                        }
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        {
                            showCreator && space.creator ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={space.creator.image || undefined} />
                                        <AvatarFallback className="text-xs">
                                            {space.creator.name?.charAt(0) || space.creator.username?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-500">
                                        {space.creator.name || space.creator.username}
                                    </span>
                                </div>
                            ) : (
                                <div />
                            )
                        }
                        <div className="flex items-center gap-1 text-xs text-neutral-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(space.createdAt)}
                        </div>
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
        </Link>
    );
}

function VisibilityBadge({ visibility, light = false }: { visibility: SpaceVisibility; light?: boolean }) {
    const config = {
        PUBLIC: {
            icon: Globe,
            label: 'Public',
            className: light
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
        },
        PRIVATE: {
            icon: Lock,
            label: 'Private',
            className: light
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
        },
        PROTECTED: {
            icon: Shield,
            label: 'Protected',
            className: light
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
        }
    };

    const { icon: Icon, label, className } = config[visibility];

    return (
        <Badge variant="outline" className={cn("flex items-center gap-1 text-xs font-medium", className)}>
            <Icon className="w-3 h-3" />
            {label}
        </Badge>
    );
}

function VisibilityIcon({ visibility }: { visibility: SpaceVisibility }) {
    const config = {
        PUBLIC: { icon: Globe, className: 'text-emerald-500' },
        PRIVATE: { icon: Lock, className: 'text-neutral-500' },
        PROTECTED: { icon: Shield, className: 'text-amber-500' }
    };

    const { icon: Icon, className } = config[visibility];
    return <Icon className={cn("w-4 h-4", className)} />;
}

function formatCategory(category: SpaceCategory): string {
    const labels: Record<SpaceCategory, string> = {
        FRONTEND: 'Frontend',
        BACKEND: 'Backend',
        FULLSTACK: 'Full Stack',
        DSA: 'DSA',
        SYSTEM_DESIGN: 'System Design',
        AI_ML: 'AI/ML',
        DEVOPS: 'DevOps',
        MOBILE: 'Mobile',
        DATABASE: 'Database',
        SECURITY: 'Security',
        BLOCKCHAIN: 'Blockchain',
        CLOUD: 'Cloud',
        INTERVIEW_PREP: 'Interview Prep',
        PROJECT_BASED: 'Project Based',
        CAREER: 'Career',
        GENERAL: 'General',
        OTHER: 'Other',
    };
    return labels[category] || category;
}

function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
}

export { VisibilityBadge, formatCategory, categoryGradients, categoryEmojis };