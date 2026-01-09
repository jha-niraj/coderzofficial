"use client";

import { motion } from 'framer-motion';
import {
    Folder, Lock, Shield, Settings
} from 'lucide-react';
import CreateSpaceButton from '../../_components/create-space-button';

export default function MySpacesHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                            <Folder className="w-8 h-8 text-white" />
                        </div>
                        My Spaces
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                        Manage your created and joined spaces. Track your progress and configure settings.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <CreateSpaceButton size="lg" className="shrink-0" />
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white">Private Spaces</span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Only you can see and access these spaces
                    </p>
                </div>
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white">Protected Spaces</span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Shared via access code with selected members
                    </p>
                </div>
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white">Space Settings</span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Click on any space to manage settings
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}