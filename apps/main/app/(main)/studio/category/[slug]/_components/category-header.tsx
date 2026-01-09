"use client";

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@repo/ui/lib/utils';
import CreateStudioSheet from '../../../_components/create-studio-sheet';

interface CategoryHeaderProps {
    title: string;
    description: string;
    gradient: string;
}

export default function CategoryHeader({ title, description, gradient }: CategoryHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-12">
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-90",
                    gradient
                )} />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
                    <div>
                        <Link
                            href="/studio/allstudios"
                            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to All Studios
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">{title}</h1>
                        <p className="text-lg text-white/80 max-w-xl">{description}</p>
                    </div>
                    <CreateStudioSheet
                        trigger={
                            <button className="shrink-0 px-6 py-3 bg-white text-neutral-900 font-semibold rounded-xl hover:bg-white/90 transition-colors">
                                Create Studio
                            </button>
                        }
                    />
                </div>
            </div>
        </motion.div>
    );
}


