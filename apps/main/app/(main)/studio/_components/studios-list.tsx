"use client";

import { motion } from 'framer-motion';
import StudioCard from './studio-card';
import { 
    FileText 
} from 'lucide-react';
import CreateStudioSheet from './create-studio-sheet';

interface Studio {
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
}

interface StudiosListProps {
    studios: Studio[];
    columns?: 2 | 3;
    showEmpty?: boolean;
    emptyMessage?: string;
    emptyAction?: boolean;
    showCreator?: boolean;
}

export default function StudiosList({
    studios,
    columns = 3,
    showEmpty = true,
    emptyMessage = 'No studios found. Create your first studio to get started!',
    emptyAction = true,
    showCreator = true
}: StudiosListProps) {
    if (studios.length === 0 && showEmpty) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 px-4"
            >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    No Studios Yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-md mb-6">
                    {emptyMessage}
                </p>
                {
                    emptyAction && (
                        <CreateStudioSheet />
                    )
                }
            </motion.div>
        );
    }

    const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid ${gridCols[columns]} gap-4`}
        >
            {
                studios.map((studio, index) => (
                    <StudioCard
                        key={studio.id}
                        studio={studio}
                        index={index}
                        showCreator={showCreator}
                    />
                ))
            }
        </motion.div>
    );
}


