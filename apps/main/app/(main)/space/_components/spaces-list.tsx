"use client";

import { motion } from 'framer-motion';
import SpaceCard from './space-card';
import type { SpaceFromDB } from '@/types/space';
import {
    Sparkles
} from 'lucide-react';
import CreateSpaceButton from './create-space-button';

interface SpacesListProps {
    spaces: SpaceFromDB[];
    variant?: 'default' | 'compact' | 'featured';
    columns?: 1 | 2 | 3;
    showEmpty?: boolean;
    emptyMessage?: string;
    emptyAction?: boolean;
}

export default function SpacesList({
    spaces,
    variant = 'default',
    columns = 2,
    showEmpty = true,
    emptyMessage = 'No spaces found. Create your first space to get started!',
    emptyAction = true
}: SpacesListProps) {
    if (spaces.length === 0 && showEmpty) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 px-4"
            >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    No Spaces Yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-md mb-6">
                    {emptyMessage}
                </p>
                {emptyAction && <CreateSpaceButton />}
            </motion.div>
        );
    }

    const gridCols = {
        1: 'grid-cols-1',
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
                spaces.map((space, index) => (
                    <SpaceCard
                        key={space.id}
                        space={space}
                        index={index}
                        variant={variant}
                    />
                ))
            }
        </motion.div>
    );
}