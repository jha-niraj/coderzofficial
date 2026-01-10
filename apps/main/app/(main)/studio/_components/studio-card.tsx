"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Badge } from '@repo/ui/components/ui/badge';
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar';
import {
    Globe, Lock, Users, BookOpen, FileText, Code, Clock, Eye, Heart
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@repo/ui/lib/utils';
import { STUDIO_CATEGORIES, getCategoryColor, type StudioCategory } from '@/types/studio';

interface StudioCardProps {
    studio: {
        id: string;
        slug: string | null;
        title: string;
        description?: string | null;
        category: string;
        visibility: string;
        views: number;
        likes: number;
        updatedAt: Date;
        user?: {
            id: string;
            name?: string | null;
            username?: string | null;
            image?: string | null;
        } | null;
        _count: {
            quizzes: number;
            flashcardDecks: number;
            codeBlocks: number;
        };
    };
    index?: number;
    showCreator?: boolean;
}

const categoryGradients: Record<string, string> = {
    PROGRAMMING: 'from-blue-500 to-cyan-600',
    WEB_DEVELOPMENT: 'from-emerald-500 to-teal-600',
    DATA_SCIENCE: 'from-purple-500 to-violet-600',
    MOBILE_DEVELOPMENT: 'from-orange-500 to-red-600',
    DEVOPS: 'from-indigo-500 to-blue-600',
    DATABASE: 'from-slate-500 to-gray-600',
    SECURITY: 'from-red-500 to-rose-600',
    AI_ML: 'from-fuchsia-500 to-purple-600',
    CLOUD: 'from-sky-500 to-cyan-600',
    SYSTEM_DESIGN: 'from-amber-500 to-orange-600',
    DSA: 'from-lime-500 to-green-600',
    INTERVIEW_PREP: 'from-pink-500 to-rose-600',
    OTHER: 'from-neutral-500 to-gray-600',
};

export default function StudioCard({ studio, index = 0, showCreator = true }: StudioCardProps) {
    const router = useRouter();
    const gradient = categoryGradients[studio.category] || categoryGradients.OTHER;
    const categoryLabel = STUDIO_CATEGORIES.find((c) => c.value === studio.category)?.label || studio.category;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -4 }}
            onClick={() => router.push(`/studio/${studio.slug || studio.id}`)}
            className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-transparent hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300 cursor-pointer"
        >
            <div className={cn("h-2 bg-gradient-to-r", gradient)} />
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {studio.title}
                        </h3>
                        <Badge className={cn("mt-1 text-xs", getCategoryColor(studio.category as StudioCategory))}>
                            {categoryLabel}
                        </Badge>
                    </div>
                    <VisibilityBadge visibility={studio.visibility} />
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-4 min-h-[40px]">
                    {studio.description || 'No description provided'}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-500 mb-4">
                    {
                        studio._count.quizzes > 0 && (
                            <div className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-medium">{studio._count.quizzes}</span>
                            </div>
                        )
                    }
                    {
                        studio._count.flashcardDecks > 0 && (
                            <div className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4" />
                                <span className="font-medium">{studio._count.flashcardDecks}</span>
                            </div>
                        )
                    }
                    {
                        studio._count.codeBlocks > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Code className="w-4 h-4" />
                                <span className="font-medium">{studio._count.codeBlocks}</span>
                            </div>
                        )
                    }
                    <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{studio.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        <span className="font-medium">{studio.likes}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    {
                        showCreator && studio.user ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={studio.user.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                        {studio.user.name?.charAt(0) || studio.user.username?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-neutral-500 dark:text-neutral-500">
                                    {studio.user.name || studio.user.username}
                                </span>
                            </div>
                        ) : (
                            <div />
                        )
                    }
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" />
                        {format(new Date(studio.updatedAt), 'MMM d, yyyy')}
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
    const config: Record<string, { icon: typeof Globe; label: string; className: string }> = {
        PUBLIC: {
            icon: Globe,
            label: 'Public',
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
        },
        PRIVATE: {
            icon: Lock,
            label: 'Private',
            className: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
        },
        COMMUNITY: {
            icon: Users,
            label: 'Community',
            className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
        }
    };

    const visibilityConfig = config[visibility] || config.PRIVATE;
    const Icon = visibilityConfig?.icon || Lock;
    const label = visibilityConfig?.label || 'Private';
    const className = visibilityConfig?.className || 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700';

    return (
        <Badge variant="outline" className={cn("flex items-center gap-1 text-xs font-medium", className)}>
            <Icon className="w-3 h-3" />
            {label}
        </Badge>
    );
}

export { VisibilityBadge };


