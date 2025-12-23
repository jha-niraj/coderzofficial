'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
    className?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionText,
    onAction,
    className = ""
}: EmptyStateProps) {
    return (
        <motion.div
            className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="mb-4 p-4 bg-muted/50 rounded-full"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Icon className="h-12 w-12 text-muted-foreground" />
            </motion.div>

            <motion.h3
                className="text-lg font-semibold text-foreground mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {title}
            </motion.h3>
            <motion.p
                className="text-muted-foreground mb-6 max-w-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {description}
            </motion.p>
            {
                actionText && onAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Button onClick={onAction} variant="outline">
                            {actionText}
                        </Button>
                    </motion.div>
                )
            }
        </motion.div>
    );
} 